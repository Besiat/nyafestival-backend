import { MigrationInterface, QueryRunner } from "typeorm";

export class VoteMigration1701112985396 implements MigrationInterface {
    name = 'VoteMigration1701112985396';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vote" ("voteId" SERIAL NOT NULL, "applicationId" character varying NOT NULL, "rating" integer NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_bbd108321554bca77aaee218112" PRIMARY KEY ("voteId"))`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a4af8f5c0cd276b9b7b12c950db"`);
        await queryRunner.query(`ALTER TABLE "application" ALTER COLUMN "subNominationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a4af8f5c0cd276b9b7b12c950db" FOREIGN KEY ("subNominationId") REFERENCES "sub_nomination"("subNominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a4af8f5c0cd276b9b7b12c950db"`);
        await queryRunner.query(`ALTER TABLE "application" ALTER COLUMN "subNominationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a4af8f5c0cd276b9b7b12c950db" FOREIGN KEY ("subNominationId") REFERENCES "sub_nomination"("subNominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "vote"`);
    }
}
