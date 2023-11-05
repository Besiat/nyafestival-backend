import { MigrationInterface, QueryRunner } from "typeorm";

export class NominationOrderMigration1699192124926 implements MigrationInterface {
    name = 'NominationOrderMigration1699192124926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination" ADD "order" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination" DROP COLUMN "order"`);
    }

}
