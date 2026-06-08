# Local development

This setup uses a local Postgres container on `127.0.0.1:5433`. The backend refuses to start in non-production mode with a remote database host unless `ALLOW_REMOTE_DB=true` is set explicitly.

## Backend

1. Copy the local env file:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Start local Postgres:

   ```powershell
   docker compose -f docker-compose.local.yml up -d
   ```

3. Put the production backup file in `local-backups/`. This directory is gitignored.

4. Restore the backup into the local database.

   For a custom-format `.dump` or `.backup` file:

   ```powershell
   docker compose -f docker-compose.local.yml exec postgres pg_restore --clean --if-exists --no-owner --no-privileges -U nyafestival_local -d nyafestival_local /backups/your-backup.dump
   ```

   For a plain `.sql` file from pgAdmin or `pg_dump`, first prepare a local-safe copy. This removes PostgreSQL 18 plain-dump wrapper lines and production ownership/privilege statements without changing file encoding:

   ```powershell
   node scripts/prepare-local-sql-dump.js local-backups/your-backup.sql local-backups/your-backup.local.sql
   docker compose -f docker-compose.local.yml exec -T postgres psql -v ON_ERROR_STOP=1 -U nyafestival_local -d nyafestival_local -c "DROP SCHEMA IF EXISTS public CASCADE;"
   docker compose -f docker-compose.local.yml exec -T postgres psql -v ON_ERROR_STOP=1 -U nyafestival_local -d nyafestival_local -f /backups/your-backup.local.sql
   ```

5. Install dependencies and start the backend:

   ```powershell
   yarn install
   $env:DOTENV_CONFIG_PATH=".env.local"; yarn start:dev
   ```

The API will be available at `http://localhost:3000`.

## Safety checks

- Do not copy production database credentials into `.env.local`.
- Keep `DB_HOST=localhost` and `DB_PORT=5433` for normal development.
- `DB_SSL=false` is expected for local Docker Postgres.
- If the backend is started with a remote `DB_HOST` while `NODE_ENV` is not `production`, it will throw before connecting.

## Reset local data

To destroy and recreate the local database volume:

```powershell
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```
