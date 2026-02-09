import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneOnConsultTable1767459675549 implements MigrationInterface {
  name = "AddPhoneOnConsultTable1767459675549";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "consults" ADD "phone" character varying(25)`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(`ALTER TABLE "consults" DROP COLUMN "phone"`);
  }
}
