import { MigrationInterface, QueryRunner } from "typeorm";

export class StageVotingMigration1702204675149 implements MigrationInterface {
    name = 'StageVotingMigration1702204675149';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stage_vote" ("stageVoteId" SERIAL NOT NULL, "applicationId" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_4074b3a90d5869da3675bee20e4" PRIMARY KEY ("stageVoteId"))`);
        await queryRunner.query(`ALTER TABLE "nomination" ALTER COLUMN "fullNameTemplate" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nomination" ALTER COLUMN "fullNameTemplate" SET DEFAULT '{name}'`);
        await queryRunner.query(`DROP TABLE "stage_vote"`);
    }

}
