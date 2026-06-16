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

    @Column({ nullable: true })
    defaultStartTime?: string;

    @Column({ default: 0 })
    order: number;

    @OneToMany(() => Block, block => block.scheduleContainer)
    blocks: Block[];
}
