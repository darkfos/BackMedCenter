import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766522841405 implements MigrationInterface {
  name = "Init1766522841405";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(125) NOT NULL, "password" text NOT NULL, "fullName" character varying(255) DEFAULT 'Пользователь', "isAdmin" boolean DEFAULT false, "createdAt" date NOT NULL DEFAULT '23-12-2025', "updatedAt" date NOT NULL DEFAULT '23-12-2025', "userType" "public"."users_usertype_enum" NOT NULL DEFAULT 'pacient', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
