import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceSpecialists1772060000000 implements MigrationInterface {
  name = "AddServiceSpecialists1772060000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "specialists" jsonb DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "specialists"`);
  }
}
