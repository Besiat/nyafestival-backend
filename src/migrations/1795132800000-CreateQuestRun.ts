import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestRun1795132800000 implements MigrationInterface {
    name = 'CreateQuestRun1795132800000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quest_run" (
            "userId" uuid NOT NULL,
            "questId" varchar(64) NOT NULL,
            "runId" uuid NOT NULL,
            "startConfirmedAt" timestamptz NOT NULL DEFAULT now(),
            "revision" integer NOT NULL DEFAULT 0,
            "snapshot" jsonb,
            CONSTRAINT "PK_quest_run" PRIMARY KEY ("userId", "questId", "runId"),
            CONSTRAINT "FK_quest_run_user" FOREIGN KEY ("userId") REFERENCES "user"("userId")
        )`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "quest_run"`);
    }
}
