// Server-side migration runner. `yarn deploy` ships it inside the release bundle as
// deploy/migrate.js, and scripts/deploy/remote/backend.sh runs it there before the new code goes live:
//
//   node deploy/migrate.js check <pm2-app>...   exit 0 = up to date, 3 = migrations pending
//   node deploy/migrate.js run <pm2-app>...     apply pending migrations
//
// Database settings (DB_*, DB_SCHEMA) come from each PM2 app's own environment (`pm2 jlist`),
// so nothing secret lives here. Every app has its own schema (nyafest-api -> public,
// coverfest-api -> coverfest) and all schemas are migrated in ONE transaction:
// either every site gets the new schema or none does.
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const { DataSource, MigrationExecutor } = require('typeorm');

const BUNDLE_DIR = path.resolve(__dirname, '..');
process.chdir(BUNDLE_DIR); // TypeORM resolves the build/migrations/*.js glob from cwd
const { DatabaseConfiguration } = require(path.join(BUNDLE_DIR, 'build/config/database.config'));

const PENDING_EXIT_CODE = 3;
const DB_ENV_KEYS = [
   'NODE_ENV',
   'DB_HOST',
   'DB_PORT',
   'DB_USERNAME',
   'DB_PASSWORD',
   'DB_DATABASE',
   'DB_SCHEMA',
   'DB_SSL',
   'ALLOW_REMOTE_DB',
];
const SCHEMA_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const readPm2Envs = names => {
   const output = execFileSync('pm2', ['jlist'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
   const json = output.split('\n').find(line => /^\[(\{|\])/.test(line));
   if (!json) throw new Error('Could not parse `pm2 jlist` output');
   const processes = JSON.parse(json);
   return names.map(name => {
      const app = processes.find(p => p.name === name);
      if (!app) throw new Error(`PM2 app "${name}" not found`);
      return { name, env: app.pm2_env.env || app.pm2_env };
   });
};

// Migrations run once per schema with search_path pointing at it, so SQL like `ALTER TABLE "public"."x"`
// would hit the public schema every time instead of the site's own schema.
const hardcodesPublicSchema = migration => /"public"\./.test(String(migration.instance && migration.instance.up));

// DatabaseConfiguration reads process.env, so build the options with the app's DB variables applied.
const typeOrmOptionsFor = env => {
   const saved = {};
   const apply = source => {
      for (const key of DB_ENV_KEYS) {
         if (source[key] === undefined) delete process.env[key];
         else process.env[key] = String(source[key]);
      }
   };
   for (const key of DB_ENV_KEYS) saved[key] = process.env[key];
   apply(env);
   try {
      return new DatabaseConfiguration().createTypeOrmOptions();
   } finally {
      apply(saved);
   }
};

const main = async () => {
   const [mode, ...appNames] = process.argv.slice(2);
   if (!['check', 'run'].includes(mode) || appNames.length === 0) {
      console.error('Usage: node deploy/migrate.js <check|run> <pm2-app>...');
      return 2;
   }

   const targets = readPm2Envs(appNames).map(({ name, env }) => {
      const options = typeOrmOptionsFor(env);
      const schema = options.schema || 'public';
      if (!SCHEMA_PATTERN.test(schema)) throw new Error(`${name}: invalid DB_SCHEMA "${schema}"`);
      return { name, schema, options };
   });

   const databaseOf = ({ options }) => `${options.host}:${options.port}/${options.database}`;
   if (new Set(targets.map(databaseOf)).size > 1) {
      throw new Error('All apps must use the same database to be migrated in one transaction');
   }
   // Two apps could share a schema - migrate each schema once.
   const schemas = targets.filter((target, index) => targets.findIndex(t => t.schema === target.schema) === index);

   const sources = [];
   let runner;
   try {
      for (const target of schemas) {
         const dataSource = new DataSource({ ...target.options, entities: [], logging: ['error', 'warn', 'migration'] });
         await dataSource.initialize();
         sources.push({ ...target, dataSource });
      }
      // One connection for everything, so all schemas share one transaction.
      runner = sources[0].dataSource.createQueryRunner();
      await runner.connect();

      let pendingTotal = 0;
      for (const source of sources) {
         const pending = await new MigrationExecutor(source.dataSource, runner).getPendingMigrations();
         pendingTotal += pending.length;
         if (mode !== 'check') continue;
         console.log(`  ${source.schema} (${source.name}): ${pending.length ? `${pending.length} pending` : 'up to date'}`);
         for (const migration of pending) {
            console.log(`    - ${migration.name}`);
            if (source.schema !== 'public' && hardcodesPublicSchema(migration)) {
               console.log(
                  `      WARNING: this migration hard-codes "public".<table> - those statements will NOT change the ` +
                     `${source.schema} schema. Use unqualified names (e.g. ALTER TABLE "user").`,
               );
            }
         }
      }
      if (mode === 'check') return pendingTotal ? PENDING_EXIT_CODE : 0;
      if (!pendingTotal) return 0;

      await runner.startTransaction();
      try {
         for (const source of sources) {
            // Migrations use unqualified table names, so point search_path at this site's schema.
            // public stays as a fallback for extension functions such as uuid_generate_v4().
            await runner.query(`SET LOCAL search_path TO "${source.schema}", public`);
            const applied = await new MigrationExecutor(source.dataSource, runner).executePendingMigrations();
            for (const migration of applied) console.log(`  ${source.schema}: applied ${migration.name}`);
         }
         await runner.commitTransaction();
         console.log('  Migrations committed.');
      } catch (error) {
         await runner.rollbackTransaction();
         console.error('  Migration failed - transaction rolled back, the database is unchanged.');
         throw error;
      }
      return 0;
   } finally {
      if (runner) await runner.release();
      for (const source of sources) await source.dataSource.destroy();
   }
};

main().then(
   code => {
      process.exitCode = code;
   },
   error => {
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
   },
);
