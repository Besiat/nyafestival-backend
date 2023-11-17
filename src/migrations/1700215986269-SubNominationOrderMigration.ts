import { MigrationInterface, QueryRunner } from "typeorm";

export class SubNominationOrderMigration1700215986269 implements MigrationInterface {
    name = 'SubNominationOrderMigration1700215986269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_nomination" ADD "order" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_nomination" DROP COLUMN "order"`);
    }

}
