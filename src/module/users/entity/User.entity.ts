import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum UserTypes {
    DOCTOR = 'doctor',
    PACIENT = 'pacient',
    REGISTER = 'register',
    MANAGER = 'manager'
}

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 125, nullable: false })
    email!: string;

    @Column({ type: 'text', nullable: false })
    password!: string;

    @Column({ type: 'varchar', length: 255, nullable: true, default: 'Пользователь' })
    fullName!: string;

    @Column({ type: 'boolean', nullable: true, default: false })
    isAdmin!: boolean;

    @Column({ type: 'date', nullable: false, default: Date.now() })
    createdAt!: Date;

    @Column({ type: 'date', nullable: false, default: Date.now() })
    updatedAt!: Date;

    @Column({ type: 'enum', enum: UserTypes, default: UserTypes.PACIENT, })
    userType!: UserTypes;
}