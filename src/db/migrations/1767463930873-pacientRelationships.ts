import { MigrationInterface, QueryRunner } from "typeorm";

export class PacientRelationships1767463930873 implements MigrationInterface {
  name = "PacientRelationships1767463930873";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analys" DROP CONSTRAINT "FK_b255c04e1c7d105f730fd0ca6d0"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pacientVisits_visit_enum" AS ENUM('visit', 'notvisit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pacientVisits" ("id" SERIAL NOT NULL, "dateVisit" date NOT NULL, "visit" "public"."pacientVisits_visit_enum" DEFAULT 'notvisit', "pacientId" integer, CONSTRAINT "PK_d81d9a872211a2f7030ecef7540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pacientprescriptions" ("id" SERIAL NOT NULL, "prescription_name" character varying(120) NOT NULL, "prescription_dosage" character varying(80) NOT NULL, "prescription_frequency" character varying(80) NOT NULL, "prescription_time" character varying(80) NOT NULL, "description" text NOT NULL, "doctorId" integer, "pacientId" integer, CONSTRAINT "PK_7cd4adc57d827a888a1074e2948" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "history_diseases" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "diseases" character varying(165) NOT NULL, "description" text DEFAULT '', "doctorId" integer, "pacientId" integer, CONSTRAINT "PK_051af6062b746352c86731ec6c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "analys" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "pacients" DROP COLUMN "dateVisit"`);
    await queryRunner.query(
      `ALTER TABLE "analys" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "analys" ADD "pacientId" integer`);
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientVisits" ADD CONSTRAINT "FK_50fda9c76607d54aedfd7556cd4" FOREIGN KEY ("pacientId") REFERENCES "pacients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "analys" ADD CONSTRAINT "FK_27eb193f7980a518a78b39fe0b4" FOREIGN KEY ("pacientId") REFERENCES "pacients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientprescriptions" ADD CONSTRAINT "FK_e01ab245f89db7c80a3fc82cd94" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientprescriptions" ADD CONSTRAINT "FK_ea5033b3e082759c5f459fad285" FOREIGN KEY ("pacientId") REFERENCES "pacients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_diseases" ADD CONSTRAINT "FK_66e20c6963f6844e97227acc8e1" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_diseases" ADD CONSTRAINT "FK_4891ceddef7b7b0f5d118f17e72" FOREIGN KEY ("pacientId") REFERENCES "pacients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "history_diseases" DROP CONSTRAINT "FK_4891ceddef7b7b0f5d118f17e72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_diseases" DROP CONSTRAINT "FK_66e20c6963f6844e97227acc8e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientprescriptions" DROP CONSTRAINT "FK_ea5033b3e082759c5f459fad285"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientprescriptions" DROP CONSTRAINT "FK_e01ab245f89db7c80a3fc82cd94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analys" DROP CONSTRAINT "FK_27eb193f7980a518a78b39fe0b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pacientVisits" DROP CONSTRAINT "FK_50fda9c76607d54aedfd7556cd4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(`ALTER TABLE "analys" DROP COLUMN "pacientId"`);
    await queryRunner.query(`ALTER TABLE "analys" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "pacients" ADD "dateVisit" date`);
    await queryRunner.query(`ALTER TABLE "analys" ADD "userId" integer`);
    await queryRunner.query(`DROP TABLE "history_diseases"`);
    await queryRunner.query(`DROP TABLE "pacientprescriptions"`);
    await queryRunner.query(`DROP TABLE "pacientVisits"`);
    await queryRunner.query(`DROP TYPE "public"."pacientVisits_visit_enum"`);
    await queryRunner.query(
      `ALTER TABLE "analys" ADD CONSTRAINT "FK_b255c04e1c7d105f730fd0ca6d0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
