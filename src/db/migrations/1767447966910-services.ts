import { MigrationInterface, QueryRunner } from "typeorm";

export class Services1767447966910 implements MigrationInterface {
  name = "Services1767447966910";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."services_clinictype_enum" AS ENUM('therapy', 'neurology', 'orthopedics', 'ophthalmology', 'dentistry', 'pediatrics', 'diagnostics', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_clinictype_enum" AS ENUM('therapy', 'neurology', 'orthopedics', 'ophthalmology', 'dentistry', 'pediatrics', 'diagnostics', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "clinicType" "public"."users_clinictype_enum" DEFAULT 'other'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clinicType"`);
    await queryRunner.query(`DROP TYPE "public"."users_clinictype_enum"`);
  }
}
