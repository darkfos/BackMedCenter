import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "@/module/users/entity/User.entity.js";

@Entity({ name: "activities" })
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Тип события (например: "Добавлен новый сотрудник", "Утверждена регистрация пользователя") */
  @Column({ type: "varchar", length: 255, nullable: false })
  eventType!: string;

  /** Кто выполнил действие (null — система) */
  @Column({ type: "int", nullable: true })
  userId!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
