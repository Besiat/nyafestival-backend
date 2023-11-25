import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Block } from "./block.entity";

@Entity()
export class ScheduleItem {
    @PrimaryGeneratedColumn('uuid')
    scheduleItemId: string;

    @Column()
    name: string;

    @Column()
    blockId: string;

    @ManyToOne(() => Block, (block) => block.scheduleItems)
    @JoinColumn({ name: 'blockId' })
    block: Block;

    @Column()
    applicationId: string;

    @Column()
    order: number;
}