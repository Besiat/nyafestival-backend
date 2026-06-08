import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { assertSafeDatabaseConfig, isLocalDatabaseHost } from "./env";

const isCompiledRuntime = __filename.endsWith(".js");

export class DatabaseConfiguration implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    assertSafeDatabaseConfig();

    const useSsl = process.env.DB_SSL === 'true' || !isLocalDatabaseHost(process.env.DB_HOST);

    return {
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: process.env.DB_SCHEMA || 'public',
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
    };
  }
}
