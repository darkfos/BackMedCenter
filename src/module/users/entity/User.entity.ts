import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { UserTypes, FormatWorks } from "@/utils/shared/entities_enums.js";
import { News } from "@/module/news";
import { Pacients } from "@/module/pacients";
import { Analyses } from "@/module/analysis";
import { ClinicTypeEntity } from "@/module/services/entity/ClinicType.entity";
import { ReviewEntity } from "@/module/services/entity/Review.entity";
import { PacientPrescriptions } from "@/module/pacients/entity/PacientPrescriptions.entity";
import { HistoryDiseases } from "@/module/pacients/entity/HistoryDiseases.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 125, unique: true, nullable: false })
  email!: string;

  @Column({ type: "text", nullable: false, select: false })
  password!: string;

  @Column({ type: "decimal", nullable: true, default: 4.85 })
  rating!: number;

  @Column({ type: "int", nullable: true, default: 1 })
  experience!: number;

  @Column({ type: "varchar", length: 255, nullable: true, default: null })
  studyBuild!: string;

  /** Образование (вуз, курсы и т.п.) */
  @Column({ type: "text", nullable: true, default: null })
  education!: string | null;

  /** Описание врача (биография, специализация) */
  @Column({ type: "text", nullable: true, default: null })
  description!: string | null;

  /** Сертификаты (названия) */
  @Column({ type: "text", array: true, nullable: true, default: [] })
  certificates!: string[];

  /** Конкретные услуги, предоставляемые врачом */
  @Column({ type: "text", array: true, nullable: true, default: [] })
  services!: string[];

  @Column({ type: "json", nullable: true, default: { days: ["пн"] } })
  dayWork!: { days: ["пн"] };

  @Column({ type: "varchar", length: 185, nullable: true, default: '' })
  position!: string;

  @Column({ type: "text", array: true, nullable: true, default: []})
  competencies!: string[];

  @Column({ type: "int", nullable: true, default: 0 })
  consultPrice!: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    default: "8:00 - 17:00",
  })
  scheduleWork!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: "Пользователь",
  })
  fullName!: string;

  @Column({ type: "varchar", length: 20, nullable: true, default: null })
  phone!: string | null;

  @Column({ type: "varchar", length: 32, nullable: true, default: null })
  policyNumber!: string | null;

  @Column({ type: "boolean", nullable: true, default: false })
  isAdmin!: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  isConfirmed!: boolean;

  @CreateDateColumn({ type: "date", nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: "date", nullable: true })
  updatedAt!: Date;

  @Column({ type: "enum", enum: UserTypes, default: UserTypes.PACIENT })
  userType!: UserTypes;

  @ManyToOne(() => ClinicTypeEntity, (clinicType) => clinicType.doctors)
  @JoinColumn()
  clinicType!: ClinicTypeEntity;

  @Column({ type: "text", nullable: true, default: null })
  avatar!: string;

  @Column({ type: "enum", enum: FormatWorks, default: FormatWorks.OCH })
  formatWork!: FormatWorks;

  /** Баланс счёта пациента (в рублях). */
  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  balance!: number;

  @OneToMany(() => News, (news) => news.user)
  news!: Array<News>;

  @OneToMany(() => Pacients, (pacient) => pacient.pacient)
  pacients!: Array<Pacients>;

  @OneToMany(() => Pacients, (pacient) => pacient.doctor)
  doctors!: Array<Pacients>;

  @OneToMany(() => PacientPrescriptions, (pacPres) => pacPres.doctor)
  pacientPrescriptions!: Array<PacientPrescriptions>;

  @OneToMany(() => Analyses, (analys) => analys.doctor)
  doctorAnalysis!: Array<Analyses>;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  myReviews!: Array<ReviewEntity>;

  @OneToMany(() => ReviewEntity, (review) => review.doctor)
  doctorReviews!: Array<ReviewEntity>

  @OneToMany(() => HistoryDiseases, (hisDiases) => hisDiases.doctor)
  doctorHistoryDiseases!: Array<HistoryDiseases>;
}
