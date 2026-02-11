import { MigrationInterface, QueryRunner } from "typeorm";

export class AnalysTable1767076387143 implements MigrationInterface {
  name = "AnalysTable1767076387143";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."analys_status_enum" AS ENUM('HEALTHY', 'SICK', 'DEAD', 'UNDEFINED', 'REMISSION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "analys" ("id" SERIAL NOT NULL, "type" character varying(255) NOT NULL, "text" text, "status" "public"."analys_status_enum" NOT NULL DEFAULT 'UNDEFINED', "assignedDate" date NOT NULL, "takenDate" date, "readyDate" date, "results" jsonb, "costs" numeric NOT NULL DEFAULT '100', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "doctorId" integer, CONSTRAINT "PK_3b6f24c9170af2519f167243829" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "analys" ADD CONSTRAINT "FK_b255c04e1c7d105f730fd0ca6d0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "analys" ADD CONSTRAINT "FK_621e7dc7ff0ada54144de8486c6" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analys" DROP CONSTRAINT "FK_621e7dc7ff0ada54144de8486c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analys" DROP CONSTRAINT "FK_b255c04e1c7d105f730fd0ca6d0"`,
    );
    await queryRunner.query(`DROP TABLE "analys"`);
    await queryRunner.query(`DROP TYPE "public"."analys_status_enum"`);
  }
}
