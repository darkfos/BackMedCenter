import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConsultTable1767450597828 implements MigrationInterface {
  name = "AddConsultTable1767450597828";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "consults" ("id" SERIAL NOT NULL, "username" character varying(125) DEFAULT 'Пользователь', "сomplaints" text DEFAULT 'Жалобы пользователя', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1dfb48f1617b7b774fd4da7a97" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum" RENAME TO "users_usertype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum" AS ENUM('doctor', 'pacient', 'register', 'manager')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum" USING "userType"::"text"::"public"."users_usertype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'pacient'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('doctor', 'pacient', 'register', 'admin', 'manager')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_old" USING "userType"::"text"::"public"."users_usertype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'pacient'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "consults"`);
  }
}
