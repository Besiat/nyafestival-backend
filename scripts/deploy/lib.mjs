// Shared helpers for the deploy/log scripts.
// The same file lives in both repos (nyafestival-backend and nyafestival) - keep them in sync.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

// SSH alias of the production server, configured in ~/.ssh/config (see DEPLOY.md).
const DEFAULT_HOST = 'nyafest';

export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

export const fail = message => {
   console.error(`\nERROR: ${message}`);
   process.exit(1);
};

export const warn = message => console.warn(`WARNING: ${message}`);

export const step = message => console.log(`\n==> ${message}`);

// ---------------------------------------------------------------------------
// SSH
// ---------------------------------------------------------------------------

export const sshHost = () => process.env.DEPLOY_HOST || DEFAULT_HOST;

// Extra ssh arguments, e.g. DEPLOY_SSH_ARGS="-i ~/.ssh/other_key -p 2222"
const sshExtraArgs = () => (process.env.DEPLOY_SSH_ARGS || '').split(/\s+/).filter(Boolean);

const ssh = (args, options) => {
   const result = spawnSync('ssh', [...sshExtraArgs(), ...args], options);
   if (result.error) fail(`Could not run ssh: ${result.error.message}`);
   return result;
};

// Returns the host to connect to; fails early with a helpful message if the default alias is missing.
export const ensureSshHost = () => {
   const host = sshHost();
   if (host !== DEFAULT_HOST) return host;

   const result = ssh(['-G', host], { encoding: 'utf8' });
   const hostname = /^hostname (.+)$/m.exec(result.stdout || '')?.[1]?.trim();
   if (!hostname || hostname === host) {
      fail(
         `SSH alias "${host}" is not configured. Add it to ~/.ssh/config (see DEPLOY.md), ` +
            'or set DEPLOY_HOST=root@<server-ip> for this run.',
      );
   }
   return host;
};

// Streams a local bash script to the server and runs it there: ssh <host> bash -s -- <args>
// Returns the remote exit code.
export const runRemoteScript = (host, scriptPath, args) => {
   for (const arg of args) {
      if (!/^[\w.-]+$/.test(arg)) fail(`Unsafe remote argument: ${arg}`);
   }
   const script = fs.readFileSync(path.join(REPO_ROOT, scriptPath), 'utf8').replace(/\r\n/g, '\n');
   const result = ssh([host, 'bash', '-s', '--', ...args], {
      input: script,
      stdio: ['pipe', 'inherit', 'inherit'],
   });
   return result.status ?? 1;
};

// Uploads a local file over ssh (no scp needed).
export const uploadFile = (host, localPath, remotePath) => {
   const result = ssh([host, `cat > '${remotePath}'`], {
      input: fs.readFileSync(localPath),
      stdio: ['pipe', 'inherit', 'inherit'],
   });
   if (result.status !== 0) fail(`Upload to ${host}:${remotePath} failed`);
};

// Runs a command on the server with the terminal attached (used for following logs).
export const runRemoteCommand = (host, command, { tty = false } = {}) => {
   const result = ssh([...(tty ? ['-t'] : []), host, command], { stdio: 'inherit' });
   return result.status ?? 1;
};

// ---------------------------------------------------------------------------
// Local commands
// ---------------------------------------------------------------------------

// Runs a shell command in the repo root (shell is needed on Windows to find yarn.cmd).
export const run = (command, { env } = {}) => {
   const result = spawnSync(command, {
      cwd: REPO_ROOT,
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: true,
   });
   if (result.status !== 0) fail(`Command failed: ${command}`);
};

// Creates a .tar.gz with the contents of `dir`. Uses the system tar (bsdtar on Windows 10+, GNU tar on Linux).
export const packDir = (dir, archive) => {
   const relativeArchive = path.relative(dir, archive).split(path.sep).join('/');
   const result = spawnSync('tar', ['-czf', relativeArchive, '.'], {
      cwd: dir,
      env: { ...process.env, COPYFILE_DISABLE: '1' }, // no macOS ._ files
      stdio: 'inherit',
   });
   if (result.error) fail(`Could not run tar: ${result.error.message}`);
   if (result.status !== 0) fail('Creating the archive failed');
};

export const formatSize = bytes => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// ---------------------------------------------------------------------------
// Git / release info
// ---------------------------------------------------------------------------

const git = (...args) => {
   const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
   return result.status === 0 ? result.stdout.trim() : null;
};

export const gitInfo = () => {
   const commit = git('rev-parse', 'HEAD');
   if (!commit) fail('Not a git repository, or git is not installed.');
   const unpushed = git('rev-list', '--count', '@{u}..HEAD');
   return {
      commit,
      shortSha: commit.slice(0, 7),
      branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
      subject: git('log', '-1', '--format=%s'),
      dirty: git('status', '--porcelain') !== '',
      unpushed: unpushed === null ? null : Number(unpushed),
      author: git('config', 'user.name') || 'unknown',
   };
};

// e.g. 20261112-103000-d6c3d32 (UTC time, so releases sort chronologically on the server)
export const makeReleaseId = info => {
   const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
   return `${stamp}-${info.shortSha}${info.dirty ? '-dirty' : ''}`;
};

export const writeReleaseInfo = (file, id, info) => {
   const release = {
      id,
      commit: info.commit,
      branch: info.branch,
      subject: info.subject,
      dirty: info.dirty,
      deployedBy: info.author,
      deployedAt: new Date().toISOString(),
   };
   fs.writeFileSync(file, `${JSON.stringify(release, null, 2)}\n`);
};

// ---------------------------------------------------------------------------
// Confirmation
// ---------------------------------------------------------------------------

export const confirm = async question => {
   if (!process.stdin.isTTY) fail('Not an interactive terminal - pass --yes to confirm.');
   const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
   const answer = await rl.question(`${question} [y/N] `);
   rl.close();
   if (!/^y(es)?$/i.test(answer.trim())) {
      console.log('Aborted.');
      process.exit(1);
   }
};

// Prints what is about to be deployed, enforces a clean working tree and asks for confirmation.
export const confirmDeploy = async ({ what, host, info, allowDirty, yes }) => {
   console.log(`Deploying ${what} to ${host}`);
   console.log(`  commit: ${info.shortSha} ${info.subject}`);
   console.log(`  branch: ${info.branch}`);

   if (info.dirty) {
      if (!allowDirty) {
         fail('You have uncommitted changes. Commit or stash them first, or pass --allow-dirty to deploy them anyway.');
      }
      warn('Deploying uncommitted changes (--allow-dirty).');
   }
   if (info.unpushed === null) warn(`Branch "${info.branch}" has no upstream - this commit may not be on GitHub.`);
   else if (info.unpushed > 0) warn(`${info.unpushed} commit(s) are not pushed to origin yet.`);
   if (info.branch !== 'master') warn(`You are on "${info.branch}", not master.`);

   if (!yes) await confirm('Continue?');
};
