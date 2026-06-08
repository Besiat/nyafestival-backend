import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNominationTypeMigration1780869000000 implements MigrationInterface {
    name = 'AddNominationTypeMigration1780869000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nomination_type" ("nominationTypeId" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "applicationsEndDate" character varying NOT NULL, "shouldBuyTicket" boolean NOT NULL, "showAccepted" boolean NOT NULL, CONSTRAINT "PK_43e8aa8cd90eeec817ec34a31ac" PRIMARY KEY ("nominationTypeId"))`);
        await queryRunner.query(`ALTER TABLE "nomination" ADD "nominationTypeId" uuid`);
        await queryRunner.query(`ALTER TABLE "nomination" ADD CONSTRAINT "FK_e00216ded3e29683410c359ce88" FOREIGN KEY ("nominationTypeId") REFERENCES "nomination_type"("nominationTypeId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination" DROP CONSTRAINT "FK_e00216ded3e29683410c359ce88"`);
        await queryRunner.query(`ALTER TABLE "nomination" DROP COLUMN "nominationTypeId"`);
        await queryRunner.query(`DROP TABLE "nomination_type"`);
    }

}
