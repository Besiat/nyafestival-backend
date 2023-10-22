import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationDateMigration1697998412898 implements MigrationInterface {
    name = 'ApplicationDateMigration1697998412898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" ADD "applicationDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "applicationDate"`);
    }

}
