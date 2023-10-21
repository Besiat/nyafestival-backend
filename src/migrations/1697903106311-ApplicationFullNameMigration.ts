import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationFullNameMigration1697903106311 implements MigrationInterface {
    name = 'ApplicationFullNameMigration1697903106311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" ADD "fullName" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "fullName"`);
    }

}
