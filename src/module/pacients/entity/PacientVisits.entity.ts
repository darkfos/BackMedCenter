// @ts-nocheck

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Pacients } from "@/module/pacients";

const APPOINTMENT_STATUS_VALUES = ["pending", "confirmed", "cancelled"] as const;
const VISIT_TYPE_VALUES = ["visit", "notvisit"] as const;

@Entity({ name: "pacientVisits" })
export class PacientVisit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date", nullable: false })
  dateVisit!: Date;

  @Column({ type: "varchar", length: 10, nullable: true, default: "09:00" })
  time!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  roomNumber!: string | null;

  @Column({
    type: "enum",
    nullable: false,
    default: "pending",
    enum: APPOINTMENT_STATUS_VALUES,
  })
  appointmentStatus!: string;

  @Column({
    type: "enum",
    nullable: true,
    default: "notvisit",
    enum: VISIT_TYPE_VALUES,
  })
  visit!: string;

  @ManyToOne(() => Pacients, (pacient) => pacient.visits)
  @JoinColumn({ name: "pacientId" })
  pacient!: Pacients;
}
