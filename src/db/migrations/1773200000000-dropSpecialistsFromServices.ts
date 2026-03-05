import { MigrationInterface, QueryRunner } from "typeorm";

export class DropSpecialistsFromServices1773200000000 implements MigrationInterface {
  name = "DropSpecialistsFromServices1773200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "specialists"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "specialists" jsonb DEFAULT '[]'`,
    );
  }
}
