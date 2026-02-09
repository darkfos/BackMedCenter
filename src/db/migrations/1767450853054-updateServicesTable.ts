import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServicesTable1767450853054 implements MigrationInterface {
  name = "UpdateServicesTable1767450853054";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "rating" numeric DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "includesIn" json DEFAULT '{"in":[]}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "includesIn"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "rating"`);
  }
}
