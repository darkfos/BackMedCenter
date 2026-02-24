import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPhoneAndPolicyNumber1730000000000 implements MigrationInterface {
  name = "AddUserPhoneAndPolicyNumber1730000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying(20) DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "policyNumber" character varying(32) DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "policyNumber"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
