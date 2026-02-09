import { MigrationInterface, QueryRunner } from "typeorm";

export class Services1767447966910 implements MigrationInterface {
  name = "Services1767447966910";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."services_clinictype_enum" AS ENUM('therapy', 'neurology', 'orthopedics', 'ophthalmology', 'dentistry', 'pediatrics', 'diagnostics', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" SERIAL NOT NULL, "title" character varying(150), "description" text, "timeWork" character varying(40), "recLike" integer DEFAULT '0', "recDeslike" integer DEFAULT '0', "clinicType" "public"."services_clinictype_enum" NOT NULL DEFAULT 'other', "price" numeric NOT NULL DEFAULT '2500', CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_doctors" ("serviceId" integer NOT NULL, "doctorId" integer NOT NULL, CONSTRAINT "PK_a641375e2cbe4ca3cd8b76f2aab" PRIMARY KEY ("serviceId", "doctorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e772538fa9058c474fdf8e26c0" ON "service_doctors" ("serviceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_421f0ca6c1c1d592c33044782b" ON "service_doctors" ("doctorId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_clinictype_enum" AS ENUM('therapy', 'neurology', 'orthopedics', 'ophthalmology', 'dentistry', 'pediatrics', 'diagnostics', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "clinicType" "public"."users_clinictype_enum" DEFAULT 'other'`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_doctors" ADD CONSTRAINT "FK_e772538fa9058c474fdf8e26c0e" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_doctors" ADD CONSTRAINT "FK_421f0ca6c1c1d592c33044782bc" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_doctors" DROP CONSTRAINT "FK_421f0ca6c1c1d592c33044782bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_doctors" DROP CONSTRAINT "FK_e772538fa9058c474fdf8e26c0e"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clinicType"`);
    await queryRunner.query(`DROP TYPE "public"."users_clinictype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_421f0ca6c1c1d592c33044782b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e772538fa9058c474fdf8e26c0"`,
    );
    await queryRunner.query(`DROP TABLE "service_doctors"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TYPE "public"."services_clinictype_enum"`);
  }
}
