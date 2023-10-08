import { MigrationInterface, QueryRunner } from "typeorm";

export class PageDefaultTitleMigration1696772294283 implements MigrationInterface {
    name = 'PageDefaultTitleMigration1696772294283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "title" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "title" DROP DEFAULT`);
    }

}
