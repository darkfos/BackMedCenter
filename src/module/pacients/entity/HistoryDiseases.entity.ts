import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "@/module/users";
import { Pacients } from "@/module/pacients";
import { HistoryRecordStatus } from "@/utils/shared/entities_enums.js";

@Entity({ name: "history_diseases" })
export class HistoryDiseases {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "varchar", length: 165, nullable: false })
  diseases!: string;

  @Column({ type: "text", nullable: true, default: "" })
  description!: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
    default: HistoryRecordStatus.ACTIVE,
  })
  status!: string;

  @ManyToOne(() => User, (user) => user.doctorHistoryDiseases)
  @JoinColumn()
  doctor!: User;

  @ManyToOne(() => Pacients, (pacient) => pacient.historyDiseases)
  @JoinColumn()
  pacient!: Pacients;
}
