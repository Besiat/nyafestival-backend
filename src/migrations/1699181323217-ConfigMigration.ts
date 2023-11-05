import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigMigration1699181323217 implements MigrationInterface {
    name = 'ConfigMigration1699181323217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "config" ("key" character varying NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_26489c99ddbb4c91631ef5cc791" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "application_data" DROP CONSTRAINT "FK_83ab3bf0b6643ca13feb3a20714"`);
        await queryRunner.query(`ALTER TABLE "application_data" ALTER COLUMN "applicationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_data" ADD CONSTRAINT "FK_83ab3bf0b6643ca13feb3a20714" FOREIGN KEY ("applicationId") REFERENCES "application"("applicationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_data" DROP CONSTRAINT "FK_83ab3bf0b6643ca13feb3a20714"`);
        await queryRunner.query(`ALTER TABLE "application_data" ALTER COLUMN "applicationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_data" ADD CONSTRAINT "FK_83ab3bf0b6643ca13feb3a20714" FOREIGN KEY ("applicationId") REFERENCES "application"("applicationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "config"`);
    }

}
