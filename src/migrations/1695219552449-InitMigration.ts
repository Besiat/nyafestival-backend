import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1695219552449 implements MigrationInterface {
    name = 'InitMigration1695219552449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nomination" ("nominationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fullNameTemplate" character varying NOT NULL, CONSTRAINT "PK_825cbe5943c9c4a4296065b1eea" PRIMARY KEY ("nominationId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "nickname" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "application" ("applicationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "verified" boolean NOT NULL, "accepted" integer NOT NULL, "nominationId" uuid, "applicationDataApplicationDataId" uuid, CONSTRAINT "PK_1f2d89a4ee463862f5e0b16a27e" PRIMARY KEY ("applicationId"))`);
        await queryRunner.query(`CREATE TABLE "sub_nomination" ("subNominationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fullNameTemplate" character varying NOT NULL, "nominationId" uuid, CONSTRAINT "PK_b56a758a9e68ae3804f96a2d5fd" PRIMARY KEY ("subNominationId"))`);
        await queryRunner.query(`CREATE TYPE "public"."field_fieldtype_enum" AS ENUM('0', '1', '2', '3', '4', '5')`);
        await queryRunner.query(`CREATE TABLE "field" ("fieldId" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "hint" character varying NOT NULL, "code" character varying NOT NULL, "required" boolean NOT NULL DEFAULT false, "fieldType" "public"."field_fieldtype_enum" NOT NULL, "order" integer NOT NULL, "maxFileSize" integer, "fileExtensions" character varying, CONSTRAINT "PK_bb48436e40eb3faf932ef77ad63" PRIMARY KEY ("fieldId"))`);
        await queryRunner.query(`CREATE TABLE "application_data" ("applicationDataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" text, "applicationId" uuid, "fieldId" uuid, CONSTRAINT "PK_395c5892b2ba0b5bcd1db531837" PRIMARY KEY ("applicationDataId"))`);
        await queryRunner.query(`CREATE TABLE "config_value" ("configValueId" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_fafc8f13c1c993022373a613d3b" PRIMARY KEY ("configValueId"))`);
        await queryRunner.query(`CREATE TABLE "schedule_item" ("scheduleItemId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "order" integer NOT NULL, "blockId" uuid, "onstageId" uuid, CONSTRAINT "REL_97a8638e64c6473ad39efdcbbf" UNIQUE ("onstageId"), CONSTRAINT "PK_6dd37a25d6594854ba2458b6ab6" PRIMARY KEY ("scheduleItemId"))`);
        await queryRunner.query(`CREATE TABLE "block" ("blockId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "durationInSeconds" numeric NOT NULL, "nominationId" uuid, CONSTRAINT "PK_5bdbcadcef3f691fa37dc0ec0cf" PRIMARY KEY ("blockId"))`);
        await queryRunner.query(`CREATE TABLE "page" ("pageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "route" character varying NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_f00fdb801a1189dd9dd89e4fdec" PRIMARY KEY ("pageId"))`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_d8ea023faf3ca5d74baaf201bf1" FOREIGN KEY ("nominationId") REFERENCES "sub_nomination"("subNominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_d3274fea0a1f2f87c1c7b441c19" FOREIGN KEY ("applicationDataApplicationDataId") REFERENCES "application_data"("applicationDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_nomination" ADD CONSTRAINT "FK_5e99e556a022aedbcf723f80c27" FOREIGN KEY ("nominationId") REFERENCES "nomination"("nominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_data" ADD CONSTRAINT "FK_83ab3bf0b6643ca13feb3a20714" FOREIGN KEY ("applicationId") REFERENCES "application"("applicationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_data" ADD CONSTRAINT "FK_43d8cd6787c7d10382f80345771" FOREIGN KEY ("fieldId") REFERENCES "field"("fieldId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD CONSTRAINT "FK_f40a337df76712d813034196ec6" FOREIGN KEY ("blockId") REFERENCES "block"("blockId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_item" ADD CONSTRAINT "FK_97a8638e64c6473ad39efdcbbf9" FOREIGN KEY ("onstageId") REFERENCES "application"("applicationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_c792f61216fde81477b3fe3a3a5" FOREIGN KEY ("nominationId") REFERENCES "nomination"("nominationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_c792f61216fde81477b3fe3a3a5"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP CONSTRAINT "FK_97a8638e64c6473ad39efdcbbf9"`);
        await queryRunner.query(`ALTER TABLE "schedule_item" DROP CONSTRAINT "FK_f40a337df76712d813034196ec6"`);
        await queryRunner.query(`ALTER TABLE "application_data" DROP CONSTRAINT "FK_43d8cd6787c7d10382f80345771"`);
        await queryRunner.query(`ALTER TABLE "application_data" DROP CONSTRAINT "FK_83ab3bf0b6643ca13feb3a20714"`);
        await queryRunner.query(`ALTER TABLE "sub_nomination" DROP CONSTRAINT "FK_5e99e556a022aedbcf723f80c27"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_d3274fea0a1f2f87c1c7b441c19"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_d8ea023faf3ca5d74baaf201bf1"`);
        await queryRunner.query(`DROP TABLE "page"`);
        await queryRunner.query(`DROP TABLE "block"`);
        await queryRunner.query(`DROP TABLE "schedule_item"`);
        await queryRunner.query(`DROP TABLE "config_value"`);
        await queryRunner.query(`DROP TABLE "application_data"`);
        await queryRunner.query(`DROP TABLE "field"`);
        await queryRunner.query(`DROP TYPE "public"."field_fieldtype_enum"`);
        await queryRunner.query(`DROP TABLE "sub_nomination"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "nomination"`);
    }

}
