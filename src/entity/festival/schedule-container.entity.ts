import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Block } from './block.entity';

export type ScheduleContainerTimeMode = 'calculated' | 'explicit' | 'none';

@Entity()
export class ScheduleContainer {
    @PrimaryGeneratedColumn('uuid')
    scheduleContainerId: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ default: 'calculated' })
    timeMode: ScheduleContainerTimeMode;

    @Column({ default: false })
    showOnApplications: boolean;

    @Column({ nullable: true })
    defaultStartTime?: string;

    @Column({ default: 0 })
    order: number;

    // Null means numbering is not locked; otherwise retains the last issued number.
    @Column({ type: 'integer', nullable: true })
    lastAssignedSequenceNumber: number | null;

    @OneToMany(() => Block, block => block.scheduleContainer)
    blocks: Block[];
}
