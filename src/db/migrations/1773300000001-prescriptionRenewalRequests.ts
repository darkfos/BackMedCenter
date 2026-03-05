import { MigrationInterface, QueryRunner } from "typeorm";

export class PrescriptionRenewalRequests1773300000001 implements MigrationInterface {
  name = "PrescriptionRenewalRequests1773300000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "prescription_renewal_requests" (
        "id" SERIAL NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "prescriptionId" integer,
        "patientUserId" integer,
        "doctorId" integer,
        CONSTRAINT "PK_prescription_renewal_requests" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_prescription_renewal_prescription" FOREIGN KEY ("prescriptionId") REFERENCES "pacientprescriptions"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_prescription_renewal_patient" FOREIGN KEY ("patientUserId") REFERENCES "users"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_prescription_renewal_doctor" FOREIGN KEY ("doctorId") REFERENCES "users"("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_prescription_renewal_doctor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_prescription_renewal_patient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_prescription_renewal_prescription"`,
    );
    await queryRunner.query(`DROP TABLE "prescription_renewal_requests"`);
  }
}
