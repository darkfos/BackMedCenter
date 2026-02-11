import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewsTable1766575873048 implements MigrationInterface {
  name = "AddNewsTable1766575873048";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."news_type_enum" AS ENUM('главная', 'здоровье', 'социальные', 'события', 'достижения', 'новости персонала')`,
    );
    await queryRunner.query(
      `CREATE TABLE "news" ("id" SERIAL NOT NULL, "type" "public"."news_type_enum" DEFAULT 'главная', "title" character varying(125) DEFAULT 'Новость', "description" text DEFAULT 'Описание новости', "createDate" TIMESTAMP DEFAULT now(), "updateDate" TIMESTAMP DEFAULT now(), "userId" integer, CONSTRAINT "REL_9198b86c4c22bf6852c43f3b44" UNIQUE ("userId"), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD CONSTRAINT "FK_9198b86c4c22bf6852c43f3b44e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT "FK_9198b86c4c22bf6852c43f3b44e"`,
    );
    await queryRunner.query(`DROP TABLE "news"`);
    await queryRunner.query(`DROP TYPE "public"."news_type_enum"`);
  }
}
