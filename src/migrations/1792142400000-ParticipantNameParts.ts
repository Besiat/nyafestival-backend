import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParticipantNameParts1792142400000 implements MigrationInterface {
    name = 'ParticipantNameParts1792142400000';

    async up(queryRunner: QueryRunner): Promise<void> {
        // Historical FIO has no reliable order. Keep it intact until the owner supplies name parts.
        await queryRunner.query(`ALTER TABLE application_participant
            ADD "lastName" varchar,
            ADD "firstName" varchar,
            ADD "middleName" varchar,
            ADD CONSTRAINT "CHK_participant_name_parts" CHECK (
                ("lastName" IS NULL AND "firstName" IS NULL AND "middleName" IS NULL)
                OR ("lastName" IS NOT NULL AND length(trim("lastName")) > 0
                    AND "firstName" IS NOT NULL AND length(trim("firstName")) > 0
                    AND "middleName" IS NOT NULL AND length(trim("middleName")) > 0)
            )`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE application_participant
            DROP CONSTRAINT "CHK_participant_name_parts",
            DROP "lastName", DROP "firstName", DROP "middleName"`);
    }
}
