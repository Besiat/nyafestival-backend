import { MigrationInterface, QueryRunner } from "typeorm";

export class QuestUserManyToOneMigration1764841184730 implements MigrationInterface {
    name = 'QuestUserManyToOneMigration1764841184730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_quest_progress" DROP CONSTRAINT "FK_a5b17cd43922a97af9c66f8ade8"`);
        await queryRunner.query(`ALTER TABLE "user_quest_progress" DROP CONSTRAINT "REL_a5b17cd43922a97af9c66f8ade"`);
        await queryRunner.query(`ALTER TABLE "user_quest_progress" ADD CONSTRAINT "FK_a5b17cd43922a97af9c66f8ade8" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_quest_progress" DROP CONSTRAINT "FK_a5b17cd43922a97af9c66f8ade8"`);
        await queryRunner.query(`ALTER TABLE "user_quest_progress" ADD CONSTRAINT "REL_a5b17cd43922a97af9c66f8ade" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_quest_progress" ADD CONSTRAINT "FK_a5b17cd43922a97af9c66f8ade8" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
