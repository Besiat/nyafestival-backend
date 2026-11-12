# Deploying and reading logs

Both repos deploy to the production VPS over SSH with plain `yarn` commands.

|              | Backend (this repo)          | Frontend (`../nyafestival`) |
| ------------ | ---------------------------- | --------------------------- |
| Deploy       | `yarn deploy`                | `yarn deploy`               |
| Roll back    | `yarn deploy:rollback`       | `yarn deploy:rollback`      |
| What is live | `yarn deploy:status`         | `yarn deploy:status`        |
| Logs         | `yarn logs` (PM2, both APIs) | `yarn logs` (nginx errors)  |

## One-time setup (per computer)

The scripts connect with `ssh nyafest`, so you need an SSH key on the server and a `nyafest` alias.
The server IP is `VPS_IP` in the backend `.env`.

1. Create a key and add it to the server. This asks for the root password one last time.

   Windows (PowerShell):

   ```powershell
   ssh-keygen -t ed25519 -f "$HOME\.ssh\nyafest_ed25519" -C "nyafest deploy"
   Get-Content "$HOME\.ssh\nyafest_ed25519.pub" | ssh root@<server-ip> "umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys"
   ```

   macOS / Linux:

   ```sh
   ssh-keygen -t ed25519 -f ~/.ssh/nyafest_ed25519 -C "nyafest deploy"
   ssh-copy-id -i ~/.ssh/nyafest_ed25519 root@<server-ip>
   ```

2. Add the alias to `~/.ssh/config` (on Windows: `C:\Users\<you>\.ssh\config`):

   ```
   Host nyafest
       HostName <server-ip>
       User root
       IdentityFile ~/.ssh/nyafest_ed25519
   ```

3. Check that `ssh nyafest uptime` works without asking for a password.

Needs Node 20+, git, and the `ssh` and `tar` that come with Windows 10+, macOS and Linux.

## Deploying the backend

```sh
yarn deploy            # asks for confirmation; --yes skips it
yarn deploy --dry-run  # build and pack only, nothing is sent to the server
```

What happens:

1. **Checks.** Refuses to deploy uncommitted changes (`--allow-dirty` overrides), warns when the commit is not pushed or you are not on `master`.
2. **Build.** Runs `yarn build` locally and uploads `build/`, `package.json` and `yarn.lock`.
3. **Install.** On the server, production dependencies are installed into a new release directory while the current version keeps running.
4. **Migrations.** If there are pending migrations, the database is backed up with `pg_dump` first. Then the migrations run for **both** sites (`public` schema for nyafest, `coverfest` schema for coverfest) in **one transaction**: either both schemas are migrated or nothing changes. If a migration fails, the deploy stops and the live code is untouched.
5. **Switch.** The new code is moved into place, `nyafest-api` and `coverfest-api` are restarted, and the script waits for both to answer on `/api-json`. If they don't come up within 60 seconds, the previous code is switched back automatically.
6. **Cleanup.** The last 5 releases are kept for rollbacks.

The APIs keep running during steps 1-4 and are down only for the restart in step 5.

### Migrations must not hard-code the schema

Every migration runs once per site, with `search_path` set to that site's schema. Use **unqualified** names in migration SQL:

```ts
await queryRunner.query(`ALTER TABLE "user" ADD "isFoyerCoordinator" boolean NOT NULL DEFAULT false`); // good
await queryRunner.query(`ALTER TABLE "public"."user" ...`); // bad: the coverfest schema is never changed
```

`typeorm migration:generate` writes enum types as `"public"."<name>_enum"`, so remove the `"public".` prefix from generated migrations.
`yarn deploy` prints a warning for pending migrations that still contain `"public".`.

### Rolling back

```sh
yarn deploy:rollback
```

Puts back the code that was live before the current release (run it again to go further back). Database migrations are **not** undone. If a release ran migrations, its directory on the server contains `db-before.dump`, a full `pg_dump -Fc` of the database taken just before them.

## Logs

```sh
yarn logs                         # both APIs: last 100 lines, then follow (Ctrl+C to stop)
yarn logs nyafest                 # only nyafest-api (also: coverfest)
yarn logs nginx                   # nginx error log (also: access)
yarn logs -n 500 --err            # more history, error stream only
yarn logs --no-follow -n 2000 > api.log   # save to a file
```

## What is on the server

| Path                                        | What                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/root/nyafestival-backend`                 | Live backend (PM2 working directory)                                                              |
| `/root/backend-deployments/<release>/`      | One directory per release: `deploy.log`, `release.json`, `db-before.dump`, code kept for rollback |
| `/root/backend-deployments/current`         | Id of the live backend release                                                                    |
| `/var/www/nyafest.ru/html`                  | Live frontend (nginx root)                                                                        |
| `/var/www/nyafest.ru/frontend-deployments/` | Frontend releases, same idea                                                                      |
| `/root/.pm2/logs/`                          | PM2 log files (`nyafest-api-out.log`, `nyafest-api-error.log`, ...)                               |

The scripts only swap `build/`, `node_modules/`, `package.json`, `yarn.lock` and `release.json` in the app directory.
They don't change the PM2 process list, the apps' environment variables, nginx configuration or uploads.
They install and migrate with the same Node binary PM2 runs the apps with
(currently `/root/backend-deployments/0364db7/runtime`, left by an earlier deploy; the scripts never delete it).

## Troubleshooting

- **"SSH alias nyafest is not configured"**: do the one-time setup above.
- **Another server or key for one run**: set `DEPLOY_HOST` (e.g. `root@1.2.3.4`) and/or `DEPLOY_SSH_ARGS` (e.g. `-i ~/.ssh/other_key -p 2222`).
  In PowerShell: `$env:DEPLOY_HOST = "root@1.2.3.4"; yarn deploy`.
- **"Another backend deploy or rollback is already running"**: someone else is deploying; wait for them to finish.
- **Full output of a past deploy**: `ssh nyafest cat /root/backend-deployments/<release>/deploy.log`.
- The scripts live in `scripts/deploy/`; `remote/backend.sh` is the part that runs on the server.
