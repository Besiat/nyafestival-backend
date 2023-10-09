import { MigrationInterface, QueryRunner } from "typeorm";

export class UserPropertiesMigration1696775397436 implements MigrationInterface {
    name = 'UserPropertiesMigration1696775397436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "vkId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "accessToken" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isAdmin" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isAdmin"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "accessToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "vkId"`);
    }

}
