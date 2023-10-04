import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTitleToPageMigration1696438420935 implements MigrationInterface {
    name = 'AddTitleToPageMigration1696438420935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" ADD "title" character varying NOT NULL DEFAULT '';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "title"`);
    }

}
