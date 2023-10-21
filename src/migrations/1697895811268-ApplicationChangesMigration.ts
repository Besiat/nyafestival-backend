import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationChangesMigration1697895811268 implements MigrationInterface {
    name = 'ApplicationChangesMigration1697895811268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "verified"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "accepted"`);
        await queryRunner.query(`ALTER TABLE "application" ADD "adminNote" character varying`);
        await queryRunner.query(`ALTER TABLE "application" ADD "state" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "application_data" DROP CONSTRAINT "FK_43d8cd6787c7d10382f80345771"`);
        await queryRunner.query(`ALTER TABLE "application_data" ALTER COLUMN "fieldId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_data" ADD CONSTRAINT "FK_43d8cd6787c7d10382f80345771" FOREIGN KEY ("fieldId") REFERENCES "field"("fieldId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_data" DROP CONSTRAINT "FK_43d8cd6787c7d10382f80345771"`);
        await queryRunner.query(`ALTER TABLE "application_data" ALTER COLUMN "fieldId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_data" ADD CONSTRAINT "FK_43d8cd6787c7d10382f80345771" FOREIGN KEY ("fieldId") REFERENCES "field"("fieldId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "adminNote"`);
        await queryRunner.query(`ALTER TABLE "application" ADD "accepted" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application" ADD "verified" boolean NOT NULL`);
    }

}
