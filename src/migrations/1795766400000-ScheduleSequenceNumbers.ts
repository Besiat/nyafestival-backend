import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduleSequenceNumbers1795766400000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "schedule_item" ADD "assignedSequenceNumber" integer');
        await queryRunner.query('ALTER TABLE "schedule_container" ADD "lastAssignedSequenceNumber" integer');
        await queryRunner.query('CREATE UNIQUE INDEX "schedule_item_assigned_sequence_unique" ON "schedule_item" ("scheduleContainerId", "assignedSequenceNumber")');
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX "schedule_item_assigned_sequence_unique"');
        await queryRunner.query('ALTER TABLE "schedule_container" DROP COLUMN "lastAssignedSequenceNumber"');
        await queryRunner.query('ALTER TABLE "schedule_item" DROP COLUMN "assignedSequenceNumber"');
    }
}
