import { MigrationInterface, QueryRunner } from "typeorm";

export class DependantOnRenamedMigration1697538966976 implements MigrationInterface {
    name = 'DependantOnRenamedMigration1697538966976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "field" RENAME COLUMN "dependantOn" TO "dependsOn"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "field" RENAME COLUMN "dependsOn" TO "dependantOn"`);
    }

}
