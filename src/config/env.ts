import * as dotenv from 'dotenv';
import * as fs from 'fs';

const getEnvPath = () => {
  if (process.env.DOTENV_CONFIG_PATH) {
    return process.env.DOTENV_CONFIG_PATH;
  }

  if (fs.existsSync('.env.local')) {
    return '.env.local';
  }

  return '.env';
};

export const loadEnv = () => {
  dotenv.config({ path: getEnvPath() });

  if (process.env.UPLOAD_PATH) {
    fs.mkdirSync(process.env.UPLOAD_PATH, { recursive: true });
  }
};

export const isLocalDatabaseHost = (host?: string) => {
  if (!host) {
    return false;
  }

  return ['localhost', '127.0.0.1', '::1', 'postgres'].includes(host);
};

export const assertSafeDatabaseConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const allowRemoteDb = process.env.ALLOW_REMOTE_DB === 'true';

  if (nodeEnv !== 'production' && !allowRemoteDb && !isLocalDatabaseHost(process.env.DB_HOST)) {
    throw new Error(
      `Refusing to start ${nodeEnv} with non-local DB_HOST="${process.env.DB_HOST}". ` +
        'Use a local Postgres database or set ALLOW_REMOTE_DB=true explicitly.'
    );
  }
};
