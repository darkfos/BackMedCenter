import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "@/module/users/entity/User.entity.js";

export type NurseTaskPriority = "high" | "normal";
export type NurseTaskStatus = "pending" | "completed";
export type NurseTaskType = "procedure" | "analysis" | "operation";

@Entity({ name: "nurse_tasks" })
export class NurseTask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "nurseId", type: "int" })
  nurseId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "nurseId" })
  nurse!: User;

  /** Имя пациента для отображения */
  @Column({ type: "varchar", length: 255, nullable: false })
  patientName!: string;

  /** Описание процедуры / задачи */
  @Column({ type: "varchar", length: 255, nullable: false })
  description!: string;

  /** Палата / кабинет */
  @Column({ type: "varchar", length: 80, nullable: true, default: null })
  room!: string | null;

  /** Время выполнения (HH:mm) */
  @Column({ type: "varchar", length: 10, nullable: false })
  scheduledTime!: string;

  /** Дата задачи (YYYY-MM-DD) */
  @Column({ type: "date", nullable: false })
  taskDate!: Date;

  @Column({ type: "varchar", length: 20, nullable: false, default: "normal" })
  priority!: NurseTaskPriority;

  @Column({ type: "varchar", length: 20, nullable: false, default: "pending" })
  status!: NurseTaskStatus;

  /** Заметка медсестры */
  @Column({ type: "text", nullable: true, default: null })
  note!: string | null;

  /** Когда выполнено */
  @Column({ type: "timestamp", nullable: true, default: null })
  completedAt!: Date | null;

  /** Тип: процедура, анализ, сторонняя операция */
  @Column({ type: "varchar", length: 30, nullable: false, default: "procedure" })
  taskType!: NurseTaskType;

  /** Ссылка на анализ (если taskType === 'analysis') */
  @Column({ name: "analysisId", type: "int", nullable: true, default: null })
  analysisId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
