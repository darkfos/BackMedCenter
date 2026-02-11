// @ts-nocheck

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { VisitType } from "@/utils";
import { Pacients } from "@/module/pacients";

@Entity({ name: "pacientVisits" })
export class PacientVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date", nullable: false })
  dateVisit: Date;

  @Column({
    type: "enum",
    nullable: true,
    default: VisitType.NOTVISIT,
    enum: VisitType,
  })
  visit: VisitType;

  @ManyToOne(() => Pacients, (pacient) => pacient.visits)
  @JoinColumn({ name: "pacientId" })
  pacient: Pacients;
}
