import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClinicTypesTable1767448719791 implements MigrationInterface {
  name = "AddClinicTypesTable1767448719791";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" RENAME COLUMN "clinicType" TO "clinicTypeId"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."services_clinictype_enum" RENAME TO "services_clinictypeid_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "clinicType" TO "clinicTypeId"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_clinictype_enum" RENAME TO "users_clinictypeid_enum"`,
    );
    await queryRunner.query(
      `CREATE TABLE "med_type" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "icon" text NOT NULL, CONSTRAINT "PK_32a4c47006c16ffa40eabb435d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "clinicTypeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "clinicTypeId" integer`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clinicTypeId"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "clinicTypeId" integer`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_ee831a4d81a0fcc8fa5ad5d5b1c" FOREIGN KEY ("clinicTypeId") REFERENCES "med_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_bf9f3d21980db21ce628b3a5455" FOREIGN KEY ("clinicTypeId") REFERENCES "med_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_bf9f3d21980db21ce628b3a5455"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_ee831a4d81a0fcc8fa5ad5d5b1c"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clinicTypeId"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "clinicTypeId" "public"."users_clinictypeid_enum" DEFAULT 'other'`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "clinicTypeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "clinicTypeId" "public"."services_clinictypeid_enum" NOT NULL DEFAULT 'other'`,
    );
    await queryRunner.query(`DROP TABLE "med_type"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_clinictypeid_enum" RENAME TO "users_clinictype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "clinicTypeId" TO "clinicType"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."services_clinictypeid_enum" RENAME TO "services_clinictype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" RENAME COLUMN "clinicTypeId" TO "clinicType"`,
    );
  }
}
