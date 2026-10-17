import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveParticipantFullName1792232400000 implements MigrationInterface {
    name = 'RemoveParticipantFullName1792232400000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE application_participant DROP COLUMN fio`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        const incomplete = await queryRunner.query(`SELECT 1 FROM application_participant
            WHERE "lastName" IS NULL OR "firstName" IS NULL OR "middleName" IS NULL LIMIT 1`);
        if (incomplete.length)
            throw new Error('Restore archived participant names or complete all name parts before reverting this migration');
        await queryRunner.query(`ALTER TABLE application_participant ADD fio varchar`);
        await queryRunner.query(`UPDATE application_participant SET fio = concat_ws(' ', "lastName", "firstName", "middleName")`);
        await queryRunner.query(`ALTER TABLE application_participant ALTER COLUMN fio SET NOT NULL,
            ADD CONSTRAINT application_participant_fio_check CHECK (length(trim(fio)) > 0)`);
    }
}
