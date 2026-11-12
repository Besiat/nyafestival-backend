import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeLegacyFioNullable1792238400000 implements MigrationInterface {
    name = 'MakeLegacyFioNullable1792238400000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "public"."application_participant" ALTER COLUMN "legacyFio" DROP NOT NULL`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "public"."application_participant" ALTER COLUMN "legacyFio" SET NOT NULL`,
        );
    }
}
