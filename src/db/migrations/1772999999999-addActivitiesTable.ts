import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivitiesTable1772999999999 implements MigrationInterface {
  name = "AddActivitiesTable1772999999999";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activities" (
        "id" SERIAL NOT NULL,
        "eventType" character varying(255) NOT NULL,
        "userId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activities_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_activities_createdAt" ON "activities" ("createdAt" DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_activities_createdAt"`);
    await queryRunner.query(`DROP TABLE "activities"`);
  }
}
