import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleMigrations1700930848400 implements MigrationInterface {
    name = 'ScheduleMigrations1700930848400';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP CONSTRAINT "FK_97a8638e64c6473ad39efdcbbf9"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP CONSTRAINT "REL_97a8638e64c6473ad39efdcbbf"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP COLUMN "onstageId"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD "applicationId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ADD "order" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP CONSTRAINT "FK_f40a337df76712d813034196ec6"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ALTER COLUMN "blockId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_c792f61216fde81477b3fe3a3a5"`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "nominationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD CONSTRAINT "FK_f40a337df76712d813034196ec6" FOREIGN KEY ("blockId") REFERENCES "block"("blockId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_c792f61216fde81477b3fe3a3a5" FOREIGN KEY ("nominationId") REFERENCES "nomination"("nominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_c792f61216fde81477b3fe3a3a5"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP CONSTRAINT "FK_f40a337df76712d813034196ec6"`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "nominationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_c792f61216fde81477b3fe3a3a5" FOREIGN KEY ("nominationId") REFERENCES "nomination"("nominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ALTER COLUMN "blockId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD CONSTRAINT "FK_f40a337df76712d813034196ec6" FOREIGN KEY ("blockId") REFERENCES "block"("blockId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP COLUMN "applicationId"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD "onstageId" uuid`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD CONSTRAINT "REL_97a8638e64c6473ad39efdcbbf" UNIQUE ("onstageId")`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD CONSTRAINT "FK_97a8638e64c6473ad39efdcbbf9" FOREIGN KEY ("onstageId") REFERENCES "application"("applicationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
