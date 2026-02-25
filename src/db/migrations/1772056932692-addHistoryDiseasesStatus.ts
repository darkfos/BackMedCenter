import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHistoryDiseasesStatus1772056932692 implements MigrationInterface {
  name = "AddHistoryDiseasesStatus1772056932692";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "history_diseases" ADD "status" character varying(20) DEFAULT 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "history_diseases" DROP COLUMN "status"`);
  }
}
