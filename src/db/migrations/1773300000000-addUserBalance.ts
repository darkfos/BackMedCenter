import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserBalance1773300000000 implements MigrationInterface {
  name = "AddUserBalance1773300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "balance" decimal(12,2) NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "balance"`);
  }
}
