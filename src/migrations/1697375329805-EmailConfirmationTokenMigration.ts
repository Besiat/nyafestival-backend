import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailConfirmationTokenMigration1697375329805 implements MigrationInterface {
    name = 'EmailConfirmationTokenMigration1697375329805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "emailConfirmationToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailConfirmationToken"`);
    }

}
