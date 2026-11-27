import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { Block } from "./block.entity";

@Entity()
@Index('schedule_item_assigned_sequence_unique', ['scheduleContainerId', 'assignedSequenceNumber'], { unique: true })
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
    scheduleContainerId: string;

    @Column({ nullable: true })
    applicationId: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    subtitle: string;

    @Column()
    order: number;

    @Column({ type: 'integer', nullable: true })
    assignedSequenceNumber: number | null;
}
