import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { ClinicTypeEntity } from "@/module/services/entity/ClinicType.entity.js";
import { User } from "@/module/users";

@Entity({ name: "services" })
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150, nullable: true })
  title!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  timeWork!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 2500 })
  price!: number;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 4.85 })
  rating!: number;

  @Column({ type: "int", default: 0 })
  recLike!: number;

  @Column({ type: "int", default: 0 })
  recDeslike!: number;

  @Column({ type: "json", nullable: true, default: [] })
  includesIn!: string[];

  @Column({ type: "json", nullable: true, default: [] })
  specialists!: string[];

  @ManyToOne(() => ClinicTypeEntity, { nullable: true })
  @JoinColumn({ name: "clinicTypeId" })
  clinicType!: ClinicTypeEntity | null;

  @ManyToMany(() => User)
  @JoinTable({
    name: "service_doctors",
    joinColumn: { name: "serviceId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "doctorId", referencedColumnName: "id" },
  })
  doctors!: User[];
}
