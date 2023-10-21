import { MigrationInterface, QueryRunner } from "typeorm";

export class FilePathRenamedMigration1697878384865 implements MigrationInterface {
    name = 'FilePathRenamedMigration1697878384865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" RENAME COLUMN "filePath" TO "fileName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" RENAME COLUMN "fileName" TO "filePath"`);
    }

}
