import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorIdToReview1769468457138 implements MigrationInterface {
    name = 'AddDoctorIdToReview1769468457138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" ADD "doctorId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_0fb82b25db634a2eabfbf4329ba" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_0fb82b25db634a2eabfbf4329ba"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "doctorId"`);
    }

}
