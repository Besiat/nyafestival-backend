import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPageOrderProperty1696772138782 implements MigrationInterface {
    name = 'AddedPageOrderProperty1696772138782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" ADD "order" integer`);
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "title" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "title" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "order"`);
    }

}
