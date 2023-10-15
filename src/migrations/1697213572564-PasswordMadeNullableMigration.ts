import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordMadeNullableMigration1697213572564 implements MigrationInterface {
    name = 'PasswordMadeNullableMigration1697213572564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }

}
