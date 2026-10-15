import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckboxFieldType1792022400000 implements MigrationInterface {
    name = 'AddCheckboxFieldType1792022400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."field_type_enum" ADD VALUE 'checkbox'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // The cast fails if checkbox fields still exist, preserving their data.
        await queryRunner.query(`ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_with_checkbox"`);
        await queryRunner.query(`CREATE TYPE "public"."field_type_enum" AS ENUM('text', 'textarea', 'upload-image', 'upload-music', 'select')`);
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "type" TYPE "public"."field_type_enum" USING "type"::text::"public"."field_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."field_type_enum_with_checkbox"`);
    }
}
