// @ts-nocheck

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { StatusPacient } from "@/utils/shared/entities_enums.js";
import { Pacients } from "@/module/pacients";

@Entity({ name: "analys" })
export class Analyses {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  type!: string;

  @Column({ type: "text", nullable: true })
  text!: string;

  @Column({
    type: "enum",
    enum: StatusPacient,
    default: StatusPacient.UNDEFINED,
  })
  status!: StatusPacient;

  // Дата назначения
  @Column({ type: "date", nullable: false })
  assignedDate!: Date;

  // Дата забора материала
  @Column({ type: "date", nullable: true })
  takenDate!: Date;

  // Дата готовности результатов
  @Column({ type: "date", nullable: true })
  readyDate!: Date;

  @Column({ type: "jsonb", nullable: true })
  results!: Record<string, any>;

  @Column({ type: "decimal", nullable: false, default: 100 })
  costs!: number;

  @UpdateDateColumn()
  updatedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Pacients, (pacient) => pacient.analyses)
  @JoinColumn({ name: "pacientId" })
  pacient!: Record<string, any>;

  @ManyToOne("User", (user) => user.doctorAnalysis)
  @JoinColumn({ name: "doctorId" })
  doctor!: Record<string, any>;
}
