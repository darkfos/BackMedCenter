import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInventoryItemsTable1773500000000 implements MigrationInterface {
  name = "AddInventoryItemsTable1773500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventory_items" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "quantity" integer NOT NULL DEFAULT 0,
        "threshold" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_items_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_items"`);
  }
}
