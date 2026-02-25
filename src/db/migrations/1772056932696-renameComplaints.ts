import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameComplaints1772056932696 implements MigrationInterface {
    name = 'RenameComplaints1772056932696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consults" RENAME COLUMN "сomplaints" TO "complaints"`);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "title" character varying(150), "description" text, "timeWork" character varying(40), "recLike" integer DEFAULT '0', "recDeslike" integer DEFAULT '0', "rating" numeric DEFAULT '4.85', "includesIn" json DEFAULT '{"in":[]}', "price" numeric NOT NULL DEFAULT '2500', "clinicTypeId" integer, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_doctors" ("serviceId" integer NOT NULL, "doctorId" integer NOT NULL, CONSTRAINT "PK_a641375e2cbe4ca3cd8b76f2aab" PRIMARY KEY ("serviceId", "doctorId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e772538fa9058c474fdf8e26c0" ON "service_doctors" ("serviceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_421f0ca6c1c1d592c33044782b" ON "service_doctors" ("doctorId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "isConfirmed" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "time" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."pacientVisits_appointmentStatus_enum" RENAME TO "pacientVisits_appointmentStatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."pacientVisits_appointmentstatus_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "appointmentStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "appointmentStatus" TYPE "public"."pacientVisits_appointmentstatus_enum" USING "appointmentStatus"::"text"::"public"."pacientVisits_appointmentstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "appointmentStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."pacientVisits_appointmentStatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "policyNumber" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_ee831a4d81a0fcc8fa5ad5d5b1c" FOREIGN KEY ("clinicTypeId") REFERENCES "med_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_doctors" ADD CONSTRAINT "FK_e772538fa9058c474fdf8e26c0e" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "service_doctors" ADD CONSTRAINT "FK_421f0ca6c1c1d592c33044782bc" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_doctors" DROP CONSTRAINT "FK_421f0ca6c1c1d592c33044782bc"`);
        await queryRunner.query(`ALTER TABLE "service_doctors" DROP CONSTRAINT "FK_e772538fa9058c474fdf8e26c0e"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_ee831a4d81a0fcc8fa5ad5d5b1c"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "policyNumber" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`CREATE TYPE "public"."pacientVisits_appointmentStatus_enum_old" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "appointmentStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "appointmentStatus" TYPE "public"."pacientVisits_appointmentStatus_enum_old" USING "appointmentStatus"::"text"::"public"."pacientVisits_appointmentStatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "appointmentStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."pacientVisits_appointmentstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."pacientVisits_appointmentStatus_enum_old" RENAME TO "pacientVisits_appointmentStatus_enum"`);
        await queryRunner.query(`ALTER TABLE "pacientVisits" ALTER COLUMN "time" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isConfirmed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_421f0ca6c1c1d592c33044782b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e772538fa9058c474fdf8e26c0"`);
        await queryRunner.query(`DROP TABLE "service_doctors"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`ALTER TABLE "consults" RENAME COLUMN "complaints" TO "сomplaints"`);
    }

}
