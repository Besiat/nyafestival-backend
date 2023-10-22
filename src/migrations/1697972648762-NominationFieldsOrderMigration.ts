import { MigrationInterface, QueryRunner } from "typeorm";

export class NominationFieldsOrderMigration1697972648762 implements MigrationInterface {
    name = 'NominationFieldsOrderMigration1697972648762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD "nominationId" uuid`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD "fieldId" uuid`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD "order" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "FK_05230c57a28a01695edab6d88a5" FOREIGN KEY ("nominationId") REFERENCES "nomination"("nominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "FK_7a3efd740814ee7ce20c20cbd9d" FOREIGN KEY ("fieldId") REFERENCES "field"("fieldId") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`
            UPDATE "nomination_fields"
            SET "nominationId" = "nominationNominationId",
                "fieldId" = "fieldFieldId"
        `);
        
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "FK_0c8937f82be4b0e14251097b575"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c8937f82be4b0e14251097b57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_573a0e4ac0f95182410d06b05b"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "PK_ae12e2df9b8349fd9b72993e57b"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP COLUMN "nominationNominationId"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP COLUMN "fieldFieldId"`);

        await queryRunner.query(`ALTER TABLE "nomination_fields" ALTER COLUMN "fieldId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ALTER COLUMN "nominationId" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "PK_5b781a7aeb9d3820655bdebfa69" PRIMARY KEY ("id")`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "FK_7a3efd740814ee7ce20c20cbd9d"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "FK_05230c57a28a01695edab6d88a5"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP COLUMN "fieldId"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP COLUMN "nominationId"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "PK_5b781a7aeb9d3820655bdebfa69"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD "fieldFieldId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "PK_573a0e4ac0f95182410d06b05ba" PRIMARY KEY ("fieldFieldId")`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD "nominationNominationId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "PK_573a0e4ac0f95182410d06b05ba"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "PK_ae12e2df9b8349fd9b72993e57b" PRIMARY KEY ("nominationNominationId", "fieldFieldId")`);
        await queryRunner.query(`CREATE INDEX "IDX_573a0e4ac0f95182410d06b05b" ON "nomination_fields" ("fieldFieldId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0c8937f82be4b0e14251097b57" ON "nomination_fields" ("nominationNominationId") `);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "FK_573a0e4ac0f95182410d06b05ba" FOREIGN KEY ("fieldFieldId") REFERENCES "field"("fieldId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "FK_0c8937f82be4b0e14251097b575" FOREIGN KEY ("nominationNominationId") REFERENCES "nomination"("nominationId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
