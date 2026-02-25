import { MigrationInterface, QueryRunner } from "typeorm";

export class DelSlugIntoClinicType1772058268457 implements MigrationInterface {
    name = 'DelSlugIntoClinicType1772058268457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "med_type" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "med_type" ADD "slug" character varying(120) NOT NULL`);
    }

}
