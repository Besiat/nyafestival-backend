import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFoyerCoordinatorRole1792627200000 implements MigrationInterface {
    name = 'AddFoyerCoordinatorRole1792627200000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isFoyerCoordinator" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isFoyerCoordinator"`);
    }
}
