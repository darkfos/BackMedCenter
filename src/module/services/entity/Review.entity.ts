import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Min, Max } from "class-validator";

import { User } from "@/module/users";

@Entity({ name: "review" })
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text", nullable: true, default: "Отзыв к врачу" })
  message!: string;

  @Column({
    type: "int",
    nullable: true,
    default: 4,
  })
  @Min(0, { message: "Рейтинг не может быть меньше 0" })
  @Max(5, { message: "Рейтинг не может быть больше 5" })
  rating!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.myReviews)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => User, (user) => user.doctorReviews)
  @JoinColumn()
  doctor!: User;
}
