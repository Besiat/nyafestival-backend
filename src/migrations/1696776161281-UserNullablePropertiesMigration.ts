import { MigrationInterface, QueryRunner } from "typeorm";

export class UserNullablePropertiesMigration1696776161281 implements MigrationInterface {
    name = 'UserNullablePropertiesMigration1696776161281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "vkId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "nickname" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "accessToken" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "accessToken" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "nickname" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "vkId" SET NOT NULL`);
    }

}
