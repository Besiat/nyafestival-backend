// Deploy the backend (nyafest-api) to the production server. See DEPLOY.md.
//
//   yarn deploy [--yes] [--allow-dirty] [--dry-run]   build, upload, migrate, switch, restart
//   yarn deploy:rollback [--yes]                      switch back to the previous release
//   yarn deploy:status                                live release, PM2 processes, recent releases
//
// The server-side half is scripts/deploy/remote/backend.sh.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
   REPO_ROOT,
   confirm,
   confirmDeploy,
   ensureSshHost,
   fail,
   formatSize,
   gitInfo,
   makeReleaseId,
   packDir,
   run,
   runRemoteScript,
   sshHost,
   step,
   uploadFile,
   writeReleaseInfo,
} from './lib.mjs';

const REMOTE_SCRIPT = 'scripts/deploy/remote/backend.sh';
const WORK_DIR = path.join(REPO_ROOT, '.deploy');

const { values: options, positionals } = parseArgs({
   options: {
      yes: { type: 'boolean', short: 'y', default: false },
      'allow-dirty': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
   },
   allowPositionals: true,
});

const deploy = async () => {
   const dryRun = options['dry-run'];
   const host = dryRun ? sshHost() : ensureSshHost();
   const info = gitInfo();

   await confirmDeploy({
      what: 'backend (nyafest-api)',
      host,
      info,
      allowDirty: options['allow-dirty'],
      yes: options.yes || dryRun,
   });
   const id = makeReleaseId(info);

   step('Building');
   run('yarn build');

   step('Packing');
   fs.rmSync(WORK_DIR, { recursive: true, force: true });
   const stage = path.join(WORK_DIR, 'stage');
   fs.mkdirSync(path.join(stage, 'deploy'), { recursive: true });
   fs.cpSync(path.join(REPO_ROOT, 'build'), path.join(stage, 'build'), { recursive: true });
   for (const file of ['package.json', 'yarn.lock']) {
      fs.copyFileSync(path.join(REPO_ROOT, file), path.join(stage, file));
   }
   fs.copyFileSync(path.join(REPO_ROOT, 'scripts/deploy/remote/migrate.js'), path.join(stage, 'deploy/migrate.js'));
   writeReleaseInfo(path.join(stage, 'release.json'), id, info);

   const archive = path.join(WORK_DIR, `backend-${id}.tar.gz`);
   packDir(stage, archive);
   console.log(`  ${path.relative(REPO_ROOT, archive)} (${formatSize(fs.statSync(archive).size)})`);

   if (dryRun) {
      console.log('\nDry run: stopping before upload. The archive is in .deploy/');
      return;
   }

   step(`Uploading to ${host}`);
   uploadFile(host, archive, `/tmp/nyaf-backend-${id}.tar.gz`);

   step('Deploying on the server');
   const status = runRemoteScript(host, REMOTE_SCRIPT, ['deploy', id]);
   fs.rmSync(WORK_DIR, { recursive: true, force: true });
   if (status !== 0) fail('Backend deploy failed - see the output above.');
};

const rollback = async () => {
   const host = ensureSshHost();
   if (!options.yes) await confirm(`Roll the backend on ${host} back to the previous release?`);
   process.exitCode = runRemoteScript(host, REMOTE_SCRIPT, ['rollback']);
};

const status = () => {
   process.exitCode = runRemoteScript(ensureSshHost(), REMOTE_SCRIPT, ['status']);
};

const commands = { deploy, rollback, status };
const command = positionals[0] ?? 'deploy';
if (!(command in commands)) fail(`Unknown command "${command}". Use: deploy | rollback | status`);
await commands[command]();
