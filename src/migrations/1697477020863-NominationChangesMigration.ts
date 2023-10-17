import { MigrationInterface, QueryRunner } from "typeorm";

export class NominationChangesMigration1697477020863 implements MigrationInterface {
    name = 'NominationChangesMigration1697477020863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_nomination" DROP COLUMN "fullNameTemplate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_nomination" ADD "fullNameTemplate" character varying NOT NULL`);
    }

}
