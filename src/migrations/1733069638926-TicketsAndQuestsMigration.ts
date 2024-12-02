import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketsAndQuestsMigration1733069638926 implements MigrationInterface {
    name = 'TicketsAndQuestsMigration1733069638926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ticket" ("ticketNumber" numeric NOT NULL, "userId" uuid, CONSTRAINT "PK_cbbc24b2a384886c1684b6c2219" PRIMARY KEY ("ticketNumber"))`);
        await queryRunner.query(`CREATE TABLE "user_quest_progress" ("userQuestProgressId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "questCode" character varying(64) NOT NULL, "lastStep" character varying(64) NOT NULL, CONSTRAINT "REL_a5b17cd43922a97af9c66f8ade" UNIQUE ("userId"), CONSTRAINT "PK_3432300c823cf5df4128efdfbf3" PRIMARY KEY ("userQuestProgressId"))`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_0e01a7c92f008418bad6bad5919" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_quest_progress" ADD CONSTRAINT "FK_a5b17cd43922a97af9c66f8ade8" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_quest_progress" DROP CONSTRAINT "FK_a5b17cd43922a97af9c66f8ade8"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_0e01a7c92f008418bad6bad5919"`);
        await queryRunner.query(`DROP TABLE "user_quest_progress"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
    }

}
