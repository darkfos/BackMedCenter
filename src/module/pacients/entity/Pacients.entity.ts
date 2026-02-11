// @ts-nocheck

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import { StatusPacient } from "@/utils/shared/entities_enums.js";
import { PacientVisit } from "@/module/pacients/entity/PacientVisits.entity";
import { Analyses } from "@/module/analysis";
import { PacientPrescriptions } from "@/module/pacients/entity/PacientPrescriptions.entity";
import { HistoryDiseases } from "@/module/pacients/entity/HistoryDiseases.entity";

@Entity({ name: "pacients" })
export class Pacients {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string;

  @Column({
    type: "enum",
    enum: StatusPacient,
    default: StatusPacient.UNDEFINED,
  })
  status!: StatusPacient;

  @ManyToOne("User", (user) => user.pacients)
  @JoinColumn({ name: "pacientId" })
  pacient!: Record<string, any>;

  @ManyToOne("User", (user) => user.doctors)
  @JoinColumn({ name: "doctorId" })
  doctor!: Record<string, any>;

  @OneToMany(() => PacientVisit, (pcVisit) => pcVisit.pacient)
  visits!: Array<PacientVisit>;

  @OneToMany(() => Analyses, (an) => an.pacient)
  analyses!: Array<Analyses>;

  @OneToMany(
    () => PacientPrescriptions,
    (pacPrescription) => pacPrescription.pacient,
  )
  prescriptions!: Array<PacientPrescriptions>;

  @OneToMany(() => HistoryDiseases, (hisDiaseases) => hisDiaseases.pacient)
  historyDiseases!: Array<HistoryDiseases>;
}
