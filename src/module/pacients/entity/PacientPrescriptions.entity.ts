// @ts-nocheck

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "@/module/users";
import { Pacients } from "@/module/pacients";

@Entity({ name: "pacientprescriptions" })
export class PacientPrescriptions {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: "prescription_name",
    type: "varchar",
    length: 120,
    nullable: false,
  })
  prescriptionName!: string;

  @Column({
    name: "prescription_dosage",
    type: "varchar",
    length: 80,
    nullable: false,
  })
  prescriptionDosage!: string;

  @Column({
    name: "prescription_frequency",
    type: "varchar",
    length: 80,
    nullable: false,
  })
  prescriptionFrequency!: string;

  @Column({
    name: "prescription_time",
    type: "varchar",
    length: 80,
    nullable: false,
  })
  prescriptionTime!: string;

  @Column({ name: "description", type: "text", nullable: false })
  description!: string;

  @ManyToOne(() => User, (user) => user.pacientPrescriptions)
  @JoinColumn()
  doctor!: User;

  @ManyToOne(() => Pacients, (pacient) => pacient.prescriptions)
  @JoinColumn()
  pacient: Pacients;
}
