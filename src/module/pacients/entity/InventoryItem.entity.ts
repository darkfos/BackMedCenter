import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "inventory_items" })
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "int", nullable: false, default: 0 })
  quantity!: number;

  @Column({ type: "int", nullable: false, default: 0 })
  threshold!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
