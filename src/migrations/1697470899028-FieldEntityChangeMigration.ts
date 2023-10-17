import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldEntityChangeMigration1697470899028 implements MigrationInterface {
    name = 'FieldEntityChangeMigration1697470899028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "hint"`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "fieldType"`);
        await queryRunner.query(`DROP TYPE "public"."field_fieldtype_enum"`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "fileExtensions"`);
        await queryRunner.query(`ALTER TABLE "field" ADD "subtitle" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."field_type_enum" AS ENUM('text', 'textarea', 'upload-image', 'upload-music', 'select')`);
        await queryRunner.query(`ALTER TABLE "field" ADD "type" "public"."field_type_enum" NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."field_category_enum" AS ENUM('personal', 'application', 'extra')`);
        await queryRunner.query(`ALTER TABLE "field" ADD "category" "public"."field_category_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "field" ADD "dependantOn" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "confirmed" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "confirmed" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "dependantOn"`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."field_category_enum"`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."field_type_enum"`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "subtitle"`);
        await queryRunner.query(`ALTER TABLE "field" ADD "fileExtensions" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."field_fieldtype_enum" AS ENUM('0', '1', '2', '3', '4', '5')`);
        await queryRunner.query(`ALTER TABLE "field" ADD "fieldType" "public"."field_fieldtype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "field" ADD "hint" character varying NOT NULL`);
    }

}
