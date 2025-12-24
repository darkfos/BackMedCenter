import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { UserTypes } from "@/utils/shared/entities_enums.js";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 125, unique: true, nullable: false })
  email!: string;

  @Column({ type: "text", nullable: false })
  password!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: "Пользователь",
  })
  fullName!: string;

  @Column({ type: "boolean", nullable: true, default: false })
  isAdmin!: boolean;

  @CreateDateColumn({ type: "date", nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: "date", nullable: true })
  updatedAt!: Date;

  @Column({ type: "enum", enum: UserTypes, default: UserTypes.PACIENT })
  userType!: UserTypes;
}
