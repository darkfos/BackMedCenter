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

@Entity()
export class HistoryDiseases {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "varchar", length: 165, nullable: false })
  diseases!: string;

  @Column({ type: "text", nullable: true, default: "" })
  description!: string;

  @ManyToOne(() => User, (user) => user.doctorHistoryDiseases)
  @JoinColumn()
  doctor!: User;

  @ManyToOne(() => Pacients, (pacient) => pacient.historyDiseases)
  @JoinColumn()
  pacient!: Pacients;
}
