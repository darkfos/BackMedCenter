import { MigrationInterface, QueryRunner } from "typeorm";

export class PacientsTable1767075405770 implements MigrationInterface {
  name = "PacientsTable1767075405770";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pacients_status_enum" AS ENUM('HEALTHY', 'SICK', 'DEAD', 'UNDEFINED', 'REMISSION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pacients" ("id" SERIAL NOT NULL, "description" character varying(255), "dateVisit" date, "status" "public"."pacients_status_enum" NOT NULL DEFAULT 'UNDEFINED', "pacientId" integer, "doctorId" integer, CONSTRAINT "PK_efd730c17958fa5e57267dec081" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT "FK_9198b86c4c22bf6852c43f3b44e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT "REL_9198b86c4c22bf6852c43f3b44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "FK_9198b86c4c22bf6852c43f3b44e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacients" ADD CONSTRAINT "FK_a16d827c709d6af0e10d906a1f6" FOREIGN KEY ("pacientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacients" ADD CONSTRAINT "FK_b585223fdbf27d2320172bd5ff1" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pacients" DROP CONSTRAINT "FK_b585223fdbf27d2320172bd5ff1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacients" DROP CONSTRAINT "FK_a16d827c709d6af0e10d906a1f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT "FK_9198b86c4c22bf6852c43f3b44e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "REL_9198b86c4c22bf6852c43f3b44" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "FK_9198b86c4c22bf6852c43f3b44e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "pacients"`);
    await queryRunner.query(`DROP TYPE "public"."pacients_status_enum"`);
  }
}
