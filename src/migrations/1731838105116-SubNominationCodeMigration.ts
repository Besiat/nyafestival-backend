import { MigrationInterface, QueryRunner } from "typeorm";

export class SubNominationCodeMigration1731838105116 implements MigrationInterface {
    name = 'SubNominationCodeMigration1731838105116';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_nomination" ADD "code" character varying`);
        await queryRunner.query(`UPDATE "sub_nomination" SET "code" = 'photo' WHERE "name"= 'Фотокосплей'`);
        await queryRunner.query(`UPDATE "sub_nomination" SET "code" = 'pet' WHERE "name"= 'Pet-косплей'`);
        await queryRunner.query(`UPDATE "sub_nomination" SET "code" = 'edit' WHERE "name"= 'Конкурс эдитов'`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_nomination" DROP COLUMN "code"`);
    }
}
