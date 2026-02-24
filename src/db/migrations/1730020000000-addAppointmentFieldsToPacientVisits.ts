import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointmentFieldsToPacientVisits1730020000000
  implements MigrationInterface
{
  name = "AddAppointmentFieldsToPacientVisits1730020000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pacientVisits_appointmentStatus_enum" AS ENUM('pending', 'confirmed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientVisits" ADD "time" character varying(10) NOT NULL DEFAULT '09:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientVisits" ADD "roomNumber" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientVisits" ADD "appointmentStatus" "public"."pacientVisits_appointmentStatus_enum" NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pacientVisits" DROP COLUMN "appointmentStatus"`,
    );
    await queryRunner.query(`ALTER TABLE "pacientVisits" DROP COLUMN "roomNumber"`);
    await queryRunner.query(`ALTER TABLE "pacientVisits" DROP COLUMN "time"`);
    await queryRunner.query(
      `DROP TYPE "public"."pacientVisits_appointmentStatus_enum"`,
    );
  }
}
