import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNurseTasksTable1773400000000 implements MigrationInterface {
  name = "AddNurseTasksTable1773400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "nurse_tasks" (
        "id" SERIAL NOT NULL,
        "nurseId" integer NOT NULL,
        "patientName" character varying(255) NOT NULL,
        "description" character varying(255) NOT NULL,
        "room" character varying(80),
        "scheduledTime" character varying(10) NOT NULL,
        "taskDate" date NOT NULL,
        "priority" character varying(20) NOT NULL DEFAULT 'normal',
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "note" text,
        "completedAt" TIMESTAMP,
        "taskType" character varying(30) NOT NULL DEFAULT 'procedure',
        "analysisId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_nurse_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_nurse_tasks_nurseId" FOREIGN KEY ("nurseId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_nurse_tasks_nurseId_taskDate" ON "nurse_tasks" ("nurseId", "taskDate")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_nurse_tasks_nurseId_taskDate"`);
    await queryRunner.query(`DROP TABLE "nurse_tasks"`);
  }
}
