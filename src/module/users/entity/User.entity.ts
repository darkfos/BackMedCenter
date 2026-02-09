import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { UserTypes, FormatWorks } from "@/utils";
import { News } from "@/module/news";
import { Pacients } from "@/module/pacients";
import { Analyses } from "@/module/analysis";
import { Service } from "@/module/services/entity/Service.entity";
import { ClinicTypeEntity } from "@/module/services/entity/ClinicType.entity";
import { ReviewEntity } from "@/module/services/entity/Review.entity";
import { PacientPrescriptions } from "@/module/pacients/entity/PacientPrescriptions.entity";
import { HistoryDiseases } from "@/module/pacients/entity/HistoryDiseases.entity";
import { ReviewService } from "@/module/services";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 125, unique: true, nullable: false })
  email!: string;

  @Column({ type: "text", nullable: false })
  password!: string;

  @Column({ type: "decimal", nullable: true, default: 4.85 })
  rating!: number;

  @Column({ type: "int", nullable: true, default: 1 })
  experience!: number;

  @Column({ type: "varchar", length: 255, nullable: true, default: null })
  studyBuild!: string;

  @Column({ type: "json", nullable: true, default: { days: ["пн"] } })
  dayWork!: { days: ["пн"] };

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

  @Column({ type: "boolean", nullable: true, default: false })
  isAdmin!: boolean;

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

  @ManyToMany(() => Service, (services) => services.doctors)
  services!: Array<Record<string, any>>;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  myReviews!: Array<ReviewEntity>;

  @OneToMany(() => ReviewEntity, (review) => review.doctor)
  doctorReviews!: Array<ReviewEntity>

  @OneToMany(() => HistoryDiseases, (hisDiases) => hisDiases.doctor)
  doctorHistoryDiseases!: Array<HistoryDiseases>;
}
