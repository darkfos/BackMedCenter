import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewsTable1767452075153 implements MigrationInterface {
  name = "AddReviewsTable1767452075153";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "review" ("id" SERIAL NOT NULL, "message" text DEFAULT 'Отзыв к врачу', "rating" integer DEFAULT '4', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "rating" numeric DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "experience" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "studyBuild" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT '4.85'`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "rating" SET DEFAULT 4.85`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "studyBuild"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "experience"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "rating"`);
    await queryRunner.query(`DROP TABLE "review"`);
  }
}
