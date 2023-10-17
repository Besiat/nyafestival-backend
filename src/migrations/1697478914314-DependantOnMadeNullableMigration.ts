import { MigrationInterface, QueryRunner } from "typeorm";

export class DependantOnMadeNullableMigration1697478914314 implements MigrationInterface {
    name = 'DependantOnMadeNullableMigration1697478914314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "dependantOn" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "dependantOn" SET NOT NULL`);
    }

}
