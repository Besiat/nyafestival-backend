import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationMediaCategoryMigration1697916403985 implements MigrationInterface {
    name = 'ApplicationMediaCategoryMigration1697916403985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."field_category_enum" RENAME TO "field_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."field_category_enum" AS ENUM('personal', 'application', 'extra', 'application-media')`);
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "category" TYPE "public"."field_category_enum" USING "category"::"text"::"public"."field_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."field_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."field_category_enum_old" AS ENUM('personal', 'application', 'extra')`);
        await queryRunner.query(`ALTER TABLE "field" ALTER COLUMN "category" TYPE "public"."field_category_enum_old" USING "category"::"text"::"public"."field_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."field_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."field_category_enum_old" RENAME TO "field_category_enum"`);
    }

}
