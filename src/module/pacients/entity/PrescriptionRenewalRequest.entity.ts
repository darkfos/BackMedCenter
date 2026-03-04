// @ts-nocheck

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PacientPrescriptions } from "@/module/pacients/entity/PacientPrescriptions.entity";
import { User } from "@/module/users";

const STATUS_VALUES = ["pending", "approved", "rejected"] as const;

@Entity({ name: "prescription_renewal_requests" })
export class PrescriptionRenewalRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PacientPrescriptions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "prescriptionId" })
  prescription!: PacientPrescriptions;

  @ManyToOne(() => User)
  @JoinColumn({ name: "patientUserId" })
  patientUser!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "doctorId" })
  doctor!: User;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
