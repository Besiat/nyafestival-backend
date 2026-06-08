const fs = require('fs');

const [sourcePath, targetPath] = process.argv.slice(2);

if (!sourcePath || !targetPath) {
  console.error('Usage: node scripts/prepare-local-sql-dump.js <source.sql> <target.sql>');
  process.exit(1);
}

let sql = fs.readFileSync(sourcePath, 'utf8');

sql = sql
  .split(/\r?\n/)
  .filter((line) => {
    if (/^\\(restrict|unrestrict)\b/.test(line)) {
      return false;
    }

    if (/^SET transaction_timeout = /.test(line)) {
      return false;
    }

    if (/^ALTER .* OWNER TO /.test(line)) {
      return false;
    }

    if (/^(GRANT|REVOKE) /.test(line)) {
      return false;
    }

    return true;
  })
  .join('\n');

sql = sql.replace(
  'CREATE SCHEMA public;\n',
  'CREATE SCHEMA public;\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;\n'
);

fs.writeFileSync(targetPath, sql, 'utf8');
