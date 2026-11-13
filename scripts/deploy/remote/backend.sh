#!/usr/bin/env bash
# Server-side half of `yarn deploy` for the backend. It runs ON THE SERVER as root:
# scripts/deploy/deploy.mjs streams it over ssh (`ssh <host> bash -s -- <command> [args]`).
#
# Commands:
#   deploy <release-id>  install /tmp/nyaf-backend-<id>.tar.gz, run migrations, switch code, restart, health-check
#   rollback             switch back to the code that was live before the current release
#   status               live release, PM2 processes, recent releases
#
# Layout on the server:
#   /root/nyafestival-backend          live app dir (PM2 cwd). Only build/, node_modules/, package.json,
#                                      yarn.lock and release.json are swapped; everything else is untouched.
#   /root/backend-deployments/<id>/    one directory per release:
#       bundle/          unpacked upload + node_modules (moved into the app dir on switch)
#       previous/        code that was live before this release (moved back on rollback)
#       db-before.dump   pg_dump taken right before migrations (only when there were any)
#       deploy.log       output of the deploy
#   /root/backend-deployments/current  id of the live release
set -Eeuo pipefail

APP_DIR=/root/nyafestival-backend
RELEASES_DIR=/root/backend-deployments
APPS=(nyafest-api) # PM2 apps that run from APP_DIR (coverfest-api is decommissioned)
PORTS=(3000)        # port of each app above, for the health check
DB_NAME=nyafestival
KEEP_RELEASES=5
SWAP_ITEMS=(build node_modules package.json yarn.lock release.json)
RELEASE_PATTERN='[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9]-*'

log() { printf '\n==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}
trap 'printf "ERROR: command failed (line %s): %s\n" "$LINENO" "$BASH_COMMAND" >&2' ERR

lock() {
  exec 9>/tmp/nyaf-backend-deploy.lock
  flock -n 9 || die "Another backend deploy or rollback is already running."
}

current_release() { cat "$RELEASES_DIR/current" 2>/dev/null || true; }

# Puts pm2, yarn and the Node binary that PM2 runs the apps with on PATH.
setup_path() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    set +eu
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
    set -eu
  fi
  command -v pm2 >/dev/null || die "pm2 not found on PATH."

  APP_NODE=$(pm2 jlist 2>/dev/null | node -e '
    let raw = "";
    process.stdin.on("data", (d) => (raw += d)).on("end", () => {
      const json = raw.split("\n").find((line) => /^\[(\{|\])/.test(line)) || "[]";
      const app = JSON.parse(json).find((p) => p.name === process.argv[1]);
      if (app) console.log(app.pm2_env.exec_interpreter || "node");
    });' "${APPS[0]}")
  [ -n "$APP_NODE" ] || die "PM2 app ${APPS[0]} not found (check: pm2 ls)."
  if [ "$APP_NODE" = node ]; then APP_NODE=$(command -v node); fi
  [ -x "$APP_NODE" ] || die "Node interpreter $APP_NODE not found."
  PATH="$(dirname "$APP_NODE"):$PATH"
  export PATH
  command -v yarn >/dev/null || die "yarn not found on PATH."
}

# swap OUT IN: move the live items into OUT, then the items from IN into the live app dir.
swap() {
  local out=$1 in=$2 item
  [ -d "$in/build" ] || die "$in/build is missing - refusing to switch."
  for item in "${SWAP_ITEMS[@]}"; do
    if [ -e "$out/$item" ]; then die "$out/$item already exists - refusing to overwrite it."; fi
  done
  for item in "${SWAP_ITEMS[@]}"; do
    if [ -e "$APP_DIR/$item" ]; then mv -T "$APP_DIR/$item" "$out/$item"; fi
    if [ -e "$in/$item" ]; then mv -T "$in/$item" "$APP_DIR/$item"; fi
  done
}

# Restarts the apps and waits until every port answers.
restart_and_wait() {
  local port attempt ok
  pm2 restart "${APPS[@]}" >/dev/null || return 1
  for port in "${PORTS[@]}"; do
    ok=
    for attempt in $(seq 1 60); do
      if curl -fs -o /dev/null --max-time 2 "http://127.0.0.1:$port/api-json"; then
        ok=1
        break
      fi
      sleep 1
    done
    if [ -z "$ok" ]; then
      echo "  port $port: no response after ${attempt}s"
      return 1
    fi
    echo "  port $port: OK"
  done
}

# After switching away from release dir $1, point `current` at whatever was live before it.
restore_current() {
  local previous
  previous=$(cat "$1/previous-release" 2>/dev/null || true)
  if [ -n "$previous" ]; then
    echo "$previous" >"$RELEASES_DIR/current"
  else
    rm -f "$RELEASES_DIR/current"
  fi
}

# Deletes old release dirs, keeping the newest $KEEP_RELEASES. Only touches dirs created by this
# script, never the live release, and never a dir that holds the Node binary PM2 uses.
prune() {
  local dirs dir current excess i
  current=$(current_release)
  mapfile -t dirs < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -name "$RELEASE_PATTERN" | sort)
  excess=$((${#dirs[@]} - KEEP_RELEASES))
  for ((i = 0; i < excess; i++)); do
    dir=${dirs[$i]}
    if [ "$(basename "$dir")" = "$current" ]; then continue; fi
    case "$APP_NODE" in "$dir"/*) continue ;; esac
    rm -rf -- "$dir"
    echo "  removed old release $(basename "$dir")"
  done
}

cmd_deploy() {
  local id=${1:-} upload rel migrations=0
  [[ $id =~ ^[0-9]{8}-[0-9]{6}-[0-9a-f]{7,40}(-dirty)?$ ]] || die "Invalid release id '$id'."
  upload=/tmp/nyaf-backend-$id.tar.gz
  rel=$RELEASES_DIR/$id
  [ -f "$upload" ] || die "Upload $upload not found."
  [ ! -e "$rel" ] || die "Release $rel already exists."

  lock
  setup_path
  mkdir -p "$rel/bundle" "$rel/previous"
  FAILED_MARKER=$rel/FAILED
  trap 'if [ $? -ne 0 ]; then touch "$FAILED_MARKER"; fi' EXIT
  exec > >(tee -a "$rel/deploy.log") 2>&1

  log "Unpacking release $id"
  # --no-same-permissions: archives made on Windows mark everything 0777/0666; apply our umask instead.
  tar -xzf "$upload" -C "$rel/bundle" --no-same-owner --no-same-permissions --warning=no-unknown-keyword
  rm -f "$upload"

  log "Installing production dependencies (node $(node --version), yarn $(yarn --version))"
  # --ignore-engines: yarn 1 also checks the Node version of devDependencies (eslint etc.), which never run
  # here. Real runtime problems are caught by the require check below and the health check after restart.
  (cd "$rel/bundle" && yarn install --frozen-lockfile --production=true --ignore-engines --non-interactive --no-progress)
  (cd "$rel/bundle" && node -e 'require("@nestjs/core"); require("typeorm"); require("pg")') ||
    die "Installed dependencies do not load."

  log "Checking database migrations"
  node "$rel/bundle/deploy/migrate.js" check "${APPS[@]}" || migrations=$?
  case $migrations in
    0) echo "  Nothing to migrate." ;;
    3)
      log "Backing up database $DB_NAME to $rel/db-before.dump"
      (cd /tmp && sudo -u postgres pg_dump -Fc "$DB_NAME") >"$rel/db-before.dump"
      echo "  $(du -h "$rel/db-before.dump" | cut -f1)"
      log "Running migrations (in one transaction)"
      node "$rel/bundle/deploy/migrate.js" run "${APPS[@]}" ||
        die "Migrations failed. The live code was not changed."
      ;;
    *) die "Could not check migrations. The live code was not changed." ;;
  esac

  log "Switching live code to $id"
  current_release >"$rel/previous-release"
  swap "$rel/previous" "$rel/bundle"
  echo "$id" >"$RELEASES_DIR/current"

  log "Restarting ${APPS[*]}"
  if ! restart_and_wait; then
    warn "The new release did not come up - switching back to the previous code."
    swap "$rel/bundle" "$rel/previous"
    restore_current "$rel"
    restart_and_wait || die "The previous code did not come up either! Check: yarn logs"
    if [ "$migrations" = 3 ]; then
      warn "Database migrations of this release were NOT reverted. Backup from before them: $rel/db-before.dump"
    fi
    die "Deploy failed, the previous code is live again. Check: yarn logs"
  fi

  prune
  echo
  pm2 ls
  log "Deployed $id"
}

cmd_rollback() {
  local current rel previous
  lock
  setup_path
  current=$(current_release)
  [ -n "$current" ] || die "No release is recorded as live, so there is nothing to roll back to."
  rel=$RELEASES_DIR/$current
  [ -d "$rel/previous/build" ] || die "Release $current has no saved previous code; nothing to roll back to."
  previous=$(cat "$rel/previous-release" 2>/dev/null || true)
  exec > >(tee -a "$rel/deploy.log") 2>&1

  log "Rolling back $current -> ${previous:-the code that was live before it}"
  swap "$rel/bundle" "$rel/previous"
  restore_current "$rel"
  touch "$rel/ROLLED_BACK"
  restart_and_wait || die "The rolled-back code did not come up! Check: yarn logs"
  if [ -f "$rel/db-before.dump" ]; then
    warn "Database migrations of $current were NOT reverted. Backup from before them: $rel/db-before.dump"
  fi
  echo
  pm2 ls
  log "Rolled back. Live release: ${previous:-unknown (deployed before these scripts)}"
}

cmd_status() {
  local current dir flags
  setup_path
  current=$(current_release)
  echo "Live release: ${current:-unknown (deployed before these scripts)}"
  if [ -f "$APP_DIR/release.json" ]; then cat "$APP_DIR/release.json"; fi
  echo
  pm2 ls
  echo
  echo "Releases in $RELEASES_DIR (newest last):"
  find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -name "$RELEASE_PATTERN" | sort | tail -n "$KEEP_RELEASES" |
    while read -r dir; do
      flags=
      if [ "$(basename "$dir")" = "$current" ]; then flags+=" <- live"; fi
      if [ -f "$dir/ROLLED_BACK" ]; then flags+=" (rolled back)"; fi
      if [ -f "$dir/FAILED" ]; then flags+=" (failed)"; fi
      if [ -f "$dir/db-before.dump" ]; then flags+=" [db backup]"; fi
      echo "  $(basename "$dir")$flags"
    done
  echo
  df -h / | tail -n 1 | awk '{print "Disk: " $3 " used, " $4 " free (" $5 ")"}'
}

main() {
  # This script arrives on stdin; don't let any command read the rest of it.
  exec </dev/null
  umask 077
  local command=${1:-}
  shift || true
  case $command in
    deploy) cmd_deploy "$@" ;;
    rollback) cmd_rollback ;;
    status) cmd_status ;;
    *) die "Unknown command '$command' (expected deploy, rollback or status)." ;;
  esac
}

main "$@"
