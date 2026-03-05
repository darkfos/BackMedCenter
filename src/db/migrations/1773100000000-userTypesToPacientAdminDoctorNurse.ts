import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTypesToPacientAdminDoctorNurse1773100000000 implements MigrationInterface {
  name = "UserTypesToPacientAdminDoctorNurse1773100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum_new" AS ENUM('pacient', 'admin', 'doctor', 'nurse')`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_new"
      USING (
        CASE "userType"::text
          WHEN 'register' THEN 'nurse'::users_usertype_enum_new
          WHEN 'manager' THEN 'admin'::users_usertype_enum_new
          ELSE "userType"::text::users_usertype_enum_new
        END
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'pacient'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum_new" RENAME TO "users_usertype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('doctor', 'pacient', 'register', 'manager')`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_old"
      USING (
        CASE "userType"::text
          WHEN 'admin' THEN 'manager'::users_usertype_enum_old
          WHEN 'nurse' THEN 'register'::users_usertype_old
          ELSE "userType"::text::users_usertype_enum_old
        END
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'pacient'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`,
    );
  }
}
