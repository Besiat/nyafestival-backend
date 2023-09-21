import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Nomination } from "./nomination.entity";
import { ScheduleItem } from "./schedule-item.entity";

@Entity()
export class Block {
    @PrimaryGeneratedColumn('uuid')
    blockId: string;

    @Column()
    name: string;

    @ManyToOne(() => Nomination)
    @JoinColumn({ name: 'nominationId' })
    nomination: Nomination;

    @Column({ type: 'numeric' })
    durationInSeconds: number;

    @OneToMany(()=>ScheduleItem, (scheduleItem)=>scheduleItem.block)
    scheduleItems: ScheduleItem[]

    
}