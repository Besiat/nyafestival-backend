import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkedSupplementaryApplications1792056000000 implements MigrationInterface {
    name = 'LinkedSupplementaryApplications1792056000000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE nomination ADD "applicationMode" varchar NOT NULL DEFAULT 'standalone', ADD "allowedSourceNominationIds" uuid[] NOT NULL DEFAULT '{}', ADD "minParticipants" integer NOT NULL DEFAULT 0, ADD "maxParticipants" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE nomination ADD CONSTRAINT "CHK_nomination_application_mode" CHECK ("applicationMode" IN ('standalone', 'supplementary')), ADD CONSTRAINT "CHK_nomination_participant_limits" CHECK ("minParticipants" >= 0 AND ("maxParticipants" IS NULL OR "maxParticipants" >= "minParticipants"))`,
        );
        await queryRunner.query(
            `CREATE TABLE application_participant ("participantId" uuid PRIMARY KEY, "applicationId" uuid NOT NULL REFERENCES application("applicationId"), fio varchar NOT NULL CHECK (length(trim(fio)) > 0), "order" integer NOT NULL DEFAULT 0, "removedAt" timestamptz)`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_participant_application" ON application_participant("applicationId")`);
        await queryRunner.query(
            `ALTER TABLE application ADD "sourceParticipantId" uuid REFERENCES application_participant("participantId"), ADD "withdrawnAt" timestamptz`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_supplementary_participant" ON application("sourceParticipantId", "subNominationId") WHERE "sourceParticipantId" IS NOT NULL`,
        );
        // Convert existing rosters once; the application no longer reads legacy FIO answers.
        await queryRunner.query(
            `UPDATE nomination n SET "minParticipants" = 1, "maxParticipants" = CASE WHEN EXISTS (SELECT 1 FROM nomination_fields nf JOIN field f ON f."fieldId" = nf."fieldId" WHERE nf."nominationId" = n."nominationId" AND f.code = 'fio_group') THEN NULL ELSE 1 END WHERE EXISTS (SELECT 1 FROM nomination_fields nf JOIN field f ON f."fieldId" = nf."fieldId" WHERE nf."nominationId" = n."nominationId" AND f.code IN ('FIO', 'fio_group'))`,
        );
        await queryRunner.query(
            `INSERT INTO application_participant ("participantId", "applicationId", fio, "order") SELECT uuid_generate_v4(), roster."applicationId", trim(person.fio), person.position - 1 FROM (SELECT DISTINCT ON (ad."applicationId") ad."applicationId", ad.value, f.code FROM application_data ad JOIN field f ON f."fieldId" = ad."fieldId" WHERE f.code IN ('FIO', 'fio_group') AND trim(ad.value) <> '' ORDER BY ad."applicationId", (f.code = 'fio_group') DESC, ad."applicationDataId") roster CROSS JOIN LATERAL unnest(CASE WHEN roster.code = 'fio_group' THEN string_to_array(roster.value, ',') ELSE ARRAY[roster.value] END) WITH ORDINALITY person(fio, position) WHERE trim(person.fio) <> ''`,
        );
        await queryRunner.query(
            `DELETE FROM application_data WHERE "fieldId" IN (SELECT "fieldId" FROM field WHERE code IN ('FIO', 'fio_group'))`,
        );
        await queryRunner.query(
            `DELETE FROM nomination_fields WHERE "fieldId" IN (SELECT "fieldId" FROM field WHERE code IN ('FIO', 'fio_group'))`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        const children = await queryRunner.query(`SELECT 1 FROM application WHERE "sourceParticipantId" IS NOT NULL LIMIT 1`);
        if (children.length) throw new Error('Withdraw/export supplementary applications before reverting the participant schema');
        await queryRunner.query(
            `INSERT INTO nomination_fields (id, "nominationId", "fieldId", "order") SELECT uuid_generate_v4(), n."nominationId", f."fieldId", 0 FROM nomination n JOIN field f ON f.code = CASE WHEN n."maxParticipants" = 1 THEN 'FIO' ELSE 'fio_group' END WHERE n."minParticipants" > 0`,
        );
        await queryRunner.query(
            `INSERT INTO application_data ("applicationDataId", "applicationId", "fieldId", value) SELECT uuid_generate_v4(), p."applicationId", f."fieldId", string_agg(p.fio, ',' ORDER BY p."order") FROM application_participant p JOIN application a ON a."applicationId" = p."applicationId" JOIN sub_nomination s ON s."subNominationId" = a."subNominationId" JOIN nomination n ON n."nominationId" = s."nominationId" JOIN field f ON f.code = CASE WHEN n."maxParticipants" = 1 THEN 'FIO' ELSE 'fio_group' END WHERE p."removedAt" IS NULL GROUP BY p."applicationId", f."fieldId"`,
        );
        await queryRunner.query(`ALTER TABLE application DROP COLUMN "sourceParticipantId", DROP COLUMN "withdrawnAt"`);
        await queryRunner.query(`DROP TABLE application_participant`);
        await queryRunner.query(
            `ALTER TABLE nomination DROP COLUMN "applicationMode", DROP COLUMN "allowedSourceNominationIds", DROP COLUMN "minParticipants", DROP COLUMN "maxParticipants"`,
        );
    }
}
