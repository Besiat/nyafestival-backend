import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldCategoryStringMigration1697973992867 implements MigrationInterface {
    name = 'FieldCategoryStringMigration1697973992867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Add a new column with the desired changes
        await queryRunner.query(`ALTER TABLE "field" ADD "new_category" character varying`);

        // Step 2: Copy data from the old column to the new column
        await queryRunner.query(`UPDATE "field" SET "new_category" = "category"`);

        // Step 3: Drop the old column
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "category"`);

        // (Optional) Step 4: Rename the new column to match the old column's name
        await queryRunner.query(`ALTER TABLE "field" RENAME COLUMN "new_category" TO "category"`);

        await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "category" SET NOT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reversing the changes in the down migration
        await queryRunner.query(`ALTER TABLE "field" ADD "new_category" character varying NOT NULL`);
        await queryRunner.query(`UPDATE "field" SET "new_category" = "category"`);
        await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "field" RENAME COLUMN "new_category" TO "category"`);
    }

}
