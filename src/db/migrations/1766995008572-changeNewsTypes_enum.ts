import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeNewsTypesEnum1766995008572 implements MigrationInterface {
  name = "ChangeNewsTypesEnum1766995008572";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."news_type_enum" RENAME TO "news_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."news_type_enum" AS ENUM('GENERAL', 'MED', 'SOCIAL', 'EVENTS', 'CONFERENCE', 'PERSONAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "type" TYPE "public"."news_type_enum" USING "type"::"text"::"public"."news_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "type" SET DEFAULT 'GENERAL'`,
    );
    await queryRunner.query(`DROP TYPE "public"."news_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."news_type_enum_old" AS ENUM('главная', 'здоровье', 'социальные', 'события', 'достижения', 'новости персонала')`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "type" TYPE "public"."news_type_enum_old" USING "type"::"text"::"public"."news_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ALTER COLUMN "type" SET DEFAULT 'главная'`,
    );
    await queryRunner.query(`DROP TYPE "public"."news_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."news_type_enum_old" RENAME TO "news_type_enum"`,
    );
  }
}
