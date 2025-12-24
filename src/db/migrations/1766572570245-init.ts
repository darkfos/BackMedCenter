import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766572570245 implements MigrationInterface {
    name = 'Init1766572570245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "users_usertype_enum" AS ENUM('doctor', 'pacient', 'register', 'admin', 'manager')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(125) NOT NULL, "password" text NOT NULL, "fullName" character varying(255) DEFAULT 'Пользователь', "isAdmin" boolean DEFAULT false, "createdAt" date NOT NULL DEFAULT now(), "updatedAt" date DEFAULT now(), "userType" "public"."users_usertype_enum" NOT NULL DEFAULT 'pacient', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE "users_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
