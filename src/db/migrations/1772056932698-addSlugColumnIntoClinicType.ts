import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugColumnIntoClinicType1772056932698 implements MigrationInterface {
    name = 'AddSlugColumnIntoClinicType1772056932698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "med_type" ADD "slug" character varying(120) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" TYPE numeric(3,2)`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "recLike" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "recDeslike" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "includesIn" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "specialists"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "specialists" json DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "specialists"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "specialists" jsonb DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "includesIn" SET DEFAULT '{"in":[]}'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "recDeslike" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "recLike" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "rating" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "med_type" DROP COLUMN "slug"`);
    }

}
