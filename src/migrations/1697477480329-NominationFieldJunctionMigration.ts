import { MigrationInterface, QueryRunner } from "typeorm";

export class NominationFieldJunctionMigration1697477480329 implements MigrationInterface {
    name = 'NominationFieldJunctionMigration1697477480329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nomination_fields" ("nominationNominationId" uuid NOT NULL, "fieldFieldId" uuid NOT NULL, CONSTRAINT "PK_ae12e2df9b8349fd9b72993e57b" PRIMARY KEY ("nominationNominationId", "fieldFieldId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0c8937f82be4b0e14251097b57" ON "nomination_fields" ("nominationNominationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_573a0e4ac0f95182410d06b05b" ON "nomination_fields" ("fieldFieldId") `);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "FK_0c8937f82be4b0e14251097b575" FOREIGN KEY ("nominationNominationId") REFERENCES "nomination"("nominationId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" ADD CONSTRAINT "FK_573a0e4ac0f95182410d06b05ba" FOREIGN KEY ("fieldFieldId") REFERENCES "field"("fieldId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "FK_573a0e4ac0f95182410d06b05ba"`);
        await queryRunner.query(`ALTER TABLE "nomination_fields" DROP CONSTRAINT "FK_0c8937f82be4b0e14251097b575"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_573a0e4ac0f95182410d06b05b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c8937f82be4b0e14251097b57"`);
        await queryRunner.query(`DROP TABLE "nomination_fields"`);
    }

}
