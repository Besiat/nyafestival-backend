import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduleContainerApplicationVisibility1795593600000 implements MigrationInterface {
    name = 'ScheduleContainerApplicationVisibility1795593600000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "schedule_container" ADD "showOnApplications" boolean NOT NULL DEFAULT true');
        await queryRunner.query('ALTER TABLE "schedule_container" ALTER COLUMN "showOnApplications" SET DEFAULT false');
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "schedule_container" DROP COLUMN "showOnApplications"');
    }
}
