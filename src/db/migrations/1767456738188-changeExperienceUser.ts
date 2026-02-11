import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeExperienceUser1767456738188 implements MigrationInterface {
  name = "ChangeExperienceUser1767456738188";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "experience" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "experience" SET DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "experience" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "experience" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
  }
}
