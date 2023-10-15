import { MigrationInterface, QueryRunner } from "typeorm";

export class NicnameRenamedToUsernameMigration1697104603159 implements MigrationInterface {
    name = 'NicnameRenamedToUsernameMigration1697104603159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "nickname" TO "username"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "username" TO "nickname"`);
    }

}
