// Read production logs over ssh.
// The same file lives in both repos (nyafestival-backend and nyafestival) - keep them in sync.
//
//   yarn logs [target] [--lines N] [--err] [--no-follow]
//
// Targets:
//   api        both backend APIs (PM2: nyafest-api + coverfest-api)
//   nyafest    nyafest-api only
//   coverfest  coverfest-api only
//   nginx      nginx error log
//   access     nginx access log
import { parseArgs } from 'node:util';
import { ensureSshHost, fail, runRemoteCommand } from './lib.mjs';

const PM2_TARGETS = {
   api: "'/^(nyafest|coverfest)-api$/'",
   nyafest: 'nyafest-api',
   coverfest: 'coverfest-api',
};

const FILE_TARGETS = {
   nginx: '/var/log/nginx/error.log',
   access: '/var/log/nginx/access.log',
};

// pm2 is installed through nvm, which non-interactive ssh sessions don't load.
const LOAD_NVM = 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1;';

const USAGE = `Usage: yarn logs [api|nyafest|coverfest|nginx|access] [--lines N] [--err] [--no-follow]

  api        both backend APIs (PM2)
  nyafest    nyafest-api only
  coverfest  coverfest-api only
  nginx      nginx error log
  access     nginx access log

  -n, --lines N   how many lines of history to show (default 100)
  --err           only the error stream (PM2 targets)
  --no-follow     print and exit instead of following (handy for piping)`;

const { values, positionals } = parseArgs({
   options: {
      lines: { type: 'string', short: 'n', default: '100' },
      err: { type: 'boolean', default: false },
      'no-follow': { type: 'boolean', default: false },
      default: { type: 'string', default: 'api' },
      help: { type: 'boolean', short: 'h', default: false },
   },
   allowPositionals: true,
});

if (values.help) {
   console.log(USAGE);
   process.exit(0);
}

const target = positionals[0] ?? values.default;
const lines = values.lines;
const follow = !values['no-follow'];

if (!/^\d+$/.test(lines)) fail(`--lines must be a number, got "${lines}"`);

let command;
if (target in PM2_TARGETS) {
   command = `${LOAD_NVM} pm2 logs ${PM2_TARGETS[target]} --lines ${lines}`;
   if (values.err) command += ' --err';
   if (!follow) command += ' --nostream';
} else if (target in FILE_TARGETS) {
   command = `tail -n ${lines}${follow ? ' -F' : ''} ${FILE_TARGETS[target]}`;
} else {
   fail(`Unknown log target "${target}".\n\n${USAGE}`);
}

const host = ensureSshHost();
if (follow) console.log(`Following ${target} logs on ${host} - press Ctrl+C to stop.`);

// Ctrl+C is meant for the remote command; let ssh finish instead of killing this process first.
process.on('SIGINT', () => {});
process.exitCode = runRemoteCommand(host, command, { tty: follow });
