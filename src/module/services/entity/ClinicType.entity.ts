// @ts-nocheck

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { User } from "@/module/users";

@Entity({ name: "med_type" })
export class ClinicTypeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120, nullable: false })
  name!: string;

  @Column({ type: "text", nullable: false })
  icon!: string;

  @OneToMany(() => User, (users) => users.clinicType)
  doctors: Array<User>;
}
