// @ts-nocheck

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn, ManyToOne
} from "typeorm";

import { NewsTypes } from "@/utils/shared/entities_enums.js";

@Entity({ name: "news" })
export class News {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'enum',
        enum: NewsTypes,
        default: NewsTypes.GENERAL,
        nullable: true
    })
    type!: NewsTypes;

    @Column({
        type: 'varchar',
        nullable: true,
        default: 'Новость',
        length: 125
    })
    title!: string;

    @Column({
        type: 'text',
        nullable: true,
        default: 'Описание новости'
    })
    description!: string;

    @CreateDateColumn({ nullable: true })
    createDate!: Date;

    @UpdateDateColumn({ nullable: true })
    updateDate!: Date;

    @ManyToOne('User', user => user.news)
    @JoinColumn()
    user!: Record<string, any>;
}