import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveParticipantFullName1792232400000 implements MigrationInterface {
    name = 'RemoveParticipantFullName1792232400000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE application_participant RENAME COLUMN fio TO "legacyFio"`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE application_participant RENAME COLUMN "legacyFio" TO fio`);
    }
}
