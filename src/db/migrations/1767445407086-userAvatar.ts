import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAvatar1767445407086 implements MigrationInterface {
    name = 'UserAvatar1767445407086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    }

}
