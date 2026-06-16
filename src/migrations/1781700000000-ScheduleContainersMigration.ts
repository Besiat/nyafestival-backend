import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleContainersMigration1781700000000 implements MigrationInterface {
    name = 'ScheduleContainersMigration1781700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedule_container" ("scheduleContainerId" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "timeMode" character varying NOT NULL DEFAULT 'calculated', "defaultStartTime" character varying, "order" integer NOT NULL DEFAULT 0, CONSTRAINT "UQ_schedule_container_code" UNIQUE ("code"), CONSTRAINT "PK_schedule_container" PRIMARY KEY ("scheduleContainerId"))`);
        await queryRunner.query(`INSERT INTO "schedule_container" ("code", "name", "timeMode", "defaultStartTime", "order") VALUES ('main-stage', 'Сценическое расписание', 'calculated', '12:00', 0)`);
        await queryRunner.query(`ALTER TABLE "block" ADD "startTime" character varying`);
        await queryRunner.query(`ALTER TABLE "block" ADD "endTime" character varying`);
        await queryRunner.query(`ALTER TABLE "block" ADD "scheduleContainerId" uuid`);
        await queryRunner.query(`UPDATE "block" SET "scheduleContainerId" = (SELECT "scheduleContainerId" FROM "schedule_container" WHERE "code" = 'main-stage')`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "scheduleContainerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "durationInSeconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "nominationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_block_schedule_container" FOREIGN KEY ("scheduleContainerId") REFERENCES "schedule_container"("scheduleContainerId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD "subtitle" character varying`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD "scheduleContainerId" uuid`);
        await queryRunner.query(`UPDATE "schedule_item" SET "scheduleContainerId" = "block"."scheduleContainerId" FROM "block" WHERE "schedule_item"."blockId" = "block"."blockId"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ALTER COLUMN "scheduleContainerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ALTER COLUMN "applicationId" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_schedule_item_container_application" ON "schedule_item" ("scheduleContainerId", "applicationId") WHERE "applicationId" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_schedule_item_container_application"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ALTER COLUMN "applicationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ALTER COLUMN "scheduleContainerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP COLUMN "scheduleContainerId"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP COLUMN "subtitle"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_block_schedule_container"`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "scheduleContainerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "nominationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "durationInSeconds" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "scheduleContainerId"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "startTime"`);
        await queryRunner.query(`DROP TABLE "schedule_container"`);
    }
}
