import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

export class DatabaseConfiguration implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ["src/entity/**/*.ts", "build/entity/**/*.js"],
      migrations: ["src/migrations/*.ts", "build/migrations/*.js"],
      logging: true,
      synchronize: false,
      migrationsTableName: 'migrations',
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    };
  }
}