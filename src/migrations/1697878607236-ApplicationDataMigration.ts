import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationDataMigration1697878607236 implements MigrationInterface {
    name = 'ApplicationDataMigration1697878607236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_d3274fea0a1f2f87c1c7b441c19"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "applicationDataApplicationDataId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" ADD "applicationDataApplicationDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_d3274fea0a1f2f87c1c7b441c19" FOREIGN KEY ("applicationDataApplicationDataId") REFERENCES "application_data"("applicationDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
