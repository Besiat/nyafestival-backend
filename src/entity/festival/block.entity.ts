import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Nomination } from './nomination.entity';
import { ScheduleItem } from './schedule-item.entity';
import { ScheduleContainer } from './schedule-container.entity';

@Entity()
export class Block {
    @PrimaryGeneratedColumn('uuid')
    blockId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    nominationId?: string;

    @ManyToOne(() => Nomination)
    @JoinColumn({ name: 'nominationId' })
    nomination: Nomination;

    @Column({ type: 'numeric', default: 0 })
    durationInSeconds: number;

    @Column({ nullable: true })
    startTime?: string;

    @Column({ nullable: true })
    endTime?: string;

    @Column()
    scheduleContainerId: string;

    @ManyToOne(() => ScheduleContainer, scheduleContainer => scheduleContainer.blocks)
    @JoinColumn({ name: 'scheduleContainerId' })
    scheduleContainer: ScheduleContainer;

    @OneToMany(() => ScheduleItem, scheduleItem => scheduleItem.block)
    scheduleItems: ScheduleItem[];

    @Column({ default: 0 })
    order: number;
}
