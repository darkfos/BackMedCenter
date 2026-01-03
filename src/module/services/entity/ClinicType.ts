// @ts-nocheck

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { Service } from "@/module/services/entity/Service.entity";
import { User } from "@/module/users";

@Entity({ name: "med_type"} )
export class ClinicType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120, nullable: false })
  name!: string;

  @Column({ type: "text", nullable: false })
  icon!: string;

  @OneToMany(() => Service, service => service.clinicType)
  services!: Array<Service>;

  @OneToMany(() => User, users => users.clinicType)
  doctors: Array<User>;
}