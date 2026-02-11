import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeFormatWorkDoctor1767453004375 implements MigrationInterface {
  name = "ChangeFormatWorkDoctor1767453004375";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_formatwork_enum" AS ENUM('och', 'zoch')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "formatWork" "public"."users_formatwork_enum" NOT NULL DEFAULT 'och'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "formatWork"`);
    await queryRunner.query(`DROP TYPE "public"."users_formatwork_enum"`);
  }
}
