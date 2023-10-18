import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationFileMigration1697651640892 implements MigrationInterface {
    name = 'ApplicationFileMigration1697651640892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_d8ea023faf3ca5d74baaf201bf1"`);
        await queryRunner.query(`ALTER TABLE "application" RENAME COLUMN "nominationId" TO "subNominationId"`);
        await queryRunner.query(`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filePath" character varying NOT NULL, "userId" uuid NOT NULL, "uploadDate" TIMESTAMP NOT NULL DEFAULT now(), "applicationId" character varying, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a4af8f5c0cd276b9b7b12c950db" FOREIGN KEY ("subNominationId") REFERENCES "sub_nomination"("subNominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_7e7425b17f9e707331e9a6c7335" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_7e7425b17f9e707331e9a6c7335"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a4af8f5c0cd276b9b7b12c950db"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`ALTER TABLE "application" RENAME COLUMN "subNominationId" TO "nominationId"`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_d8ea023faf3ca5d74baaf201bf1" FOREIGN KEY ("nominationId") REFERENCES "sub_nomination"("subNominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
