import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1767461678381 implements MigrationInterface {
  name = "UpdateUserTable1767461678381";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "dayWork" json DEFAULT '{"days":["пн"]}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "scheduleWork" character varying(50) DEFAULT '8:00 - 17:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_formatwork_enum" RENAME TO "users_formatwork_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_formatwork_enum" AS ENUM('och', 'zoch', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "formatWork" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "formatWork" TYPE "public"."users_formatwork_enum" USING "formatWork"::"text"::"public"."users_formatwork_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "formatWork" SET DEFAULT 'och'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_formatwork_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_formatwork_enum_old" AS ENUM('och', 'zoch')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "formatWork" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "formatWork" TYPE "public"."users_formatwork_enum_old" USING "formatWork"::"text"::"public"."users_formatwork_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "formatWork" SET DEFAULT 'och'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_formatwork_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_formatwork_enum_old" RENAME TO "users_formatwork_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "scheduleWork"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dayWork"`);
  }
}
