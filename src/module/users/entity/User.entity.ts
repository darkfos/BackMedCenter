import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { UserTypes } from "@/utils";
import { News } from "@/module/news";
import { Pacients } from "@/module/pacients";
import { Analyses } from "@/module/analysis";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 125, unique: true, nullable: false })
  email!: string;

  @Column({ type: "text", nullable: false })
  password!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: "Пользователь",
  })
  fullName!: string;

  @Column({ type: "boolean", nullable: true, default: false })
  isAdmin!: boolean;

  @CreateDateColumn({ type: "date", nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: "date", nullable: true })
  updatedAt!: Date;

  @Column({ type: "enum", enum: UserTypes, default: UserTypes.PACIENT })
  userType!: UserTypes;

  @Column({ type: "text", nullable: true, default: null })
  avatar!: string;

  @OneToMany(() => News, (news) => news.user)
  news!: Array<News>;

  @OneToMany(() => Pacients, (pacient) => pacient.pacient)
  pacients!: Array<Pacients>;

  @OneToMany(() => Pacients, (pacient) => pacient.doctor)
  doctors!: Array<Pacients>;

  @OneToMany(() => Analyses, (analys) => analys.user)
  pacientAnalyses!: Array<Analyses>;

  @OneToMany(() => Analyses, (analys) => analys.doctor)
  doctorAnalysis!: Array<Analyses>;
}
