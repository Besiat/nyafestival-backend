import "reflect-metadata";
import { DataSource } from "typeorm";
import { assertSafeDatabaseConfig, isLocalDatabaseHost, loadEnv } from "../config/env";

loadEnv();
assertSafeDatabaseConfig();

const useSsl = process.env.DB_SSL === 'true' || !isLocalDatabaseHost(process.env.DB_HOST);
const isCompiledRuntime = __filename.endsWith(".js");

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [isCompiledRuntime ? "build/entity/**/*.js" : "src/entity/**/*.ts"],
    migrations: [isCompiledRuntime ? "build/migrations/*.js" : "src/migrations/*.ts"],
    logging: true,
    synchronize: false,
    migrationsTableName: 'migrations',
    ssl: useSsl,
    extra: useSsl
        ? {
            ssl: {
                rejectUnauthorized: false
            }
        }
        : undefined
});
