import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorProfileFields1772123456789 implements MigrationInterface {
  name = "AddDoctorProfileFields1772123456789";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "education" text DEFAULT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "description" text DEFAULT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "certificates" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "services" text array DEFAULT '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "services"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "certificates"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "education"`);
  }
}
