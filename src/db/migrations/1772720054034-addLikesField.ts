import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLikesField1772720054034 implements MigrationInterface {
    name = 'AddLikesField1772720054034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_userId"`);
        const hasPrescriptionRenewalTable = await queryRunner.hasTable("prescription_renewal_requests");
        if (hasPrescriptionRenewalTable) {
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_prescription_renewal_prescription"`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_prescription_renewal_patient"`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_prescription_renewal_doctor"`);
        }
        await queryRunner.query(`DROP INDEX "public"."IDX_activities_createdAt"`);
        await queryRunner.query(`CREATE TABLE "nurse_tasks" ("id" SERIAL NOT NULL, "nurseId" integer NOT NULL, "patientName" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "room" character varying(80), "scheduledTime" character varying(10) NOT NULL, "taskDate" date NOT NULL, "priority" character varying(20) NOT NULL DEFAULT 'normal', "status" character varying(20) NOT NULL DEFAULT 'pending', "note" text, "completedAt" TIMESTAMP, "taskType" character varying(30) NOT NULL DEFAULT 'procedure', "analysisId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d23b32256679efe35a07674343" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "review" ADD "likes" jsonb DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        if (hasPrescriptionRenewalTable) {
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_be4ad099bd9602626b08c6953f6" FOREIGN KEY ("prescriptionId") REFERENCES "pacientprescriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_a0f0ce04fa9bbf266dc006add67" FOREIGN KEY ("patientUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_45eb431a9c50576ba07c3ec7413" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        await queryRunner.query(`ALTER TABLE "nurse_tasks" ADD CONSTRAINT "FK_dc358fa8e95b1491a32e28d5586" FOREIGN KEY ("nurseId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nurse_tasks" DROP CONSTRAINT "FK_dc358fa8e95b1491a32e28d5586"`);
        const hasPrescriptionRenewalTable = await queryRunner.hasTable("prescription_renewal_requests");
        if (hasPrescriptionRenewalTable) {
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_45eb431a9c50576ba07c3ec7413"`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_a0f0ce04fa9bbf266dc006add67"`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" DROP CONSTRAINT "FK_be4ad099bd9602626b08c6953f6"`);
        }
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71"`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "likes"`);
        await queryRunner.query(`DROP TABLE "nurse_tasks"`);
        await queryRunner.query(`CREATE INDEX "IDX_activities_createdAt" ON "activities" ("createdAt") `);
        if (hasPrescriptionRenewalTable) {
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_prescription_renewal_doctor" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_prescription_renewal_patient" FOREIGN KEY ("patientUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            await queryRunner.query(`ALTER TABLE "prescription_renewal_requests" ADD CONSTRAINT "FK_prescription_renewal_prescription" FOREIGN KEY ("prescriptionId") REFERENCES "pacientprescriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
