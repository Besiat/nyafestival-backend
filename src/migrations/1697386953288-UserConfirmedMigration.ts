import { MigrationInterface, QueryRunner } from "typeorm";

export class UserConfirmedMigration1697386953288 implements MigrationInterface {
    name = 'UserConfirmedMigration1697386953288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "confirmed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "confirmed"`);
    }

}
