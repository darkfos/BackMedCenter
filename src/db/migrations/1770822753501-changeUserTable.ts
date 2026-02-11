import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserTable1770822753501 implements MigrationInterface {
    name = 'ChangeUserTable1770822753501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "position" character varying(185) DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "competencies" text array DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "consultPrice" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "consultPrice"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "competencies"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "position"`);
    }

}
