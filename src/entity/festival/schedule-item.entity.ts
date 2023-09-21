import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Block } from "./block.entity";
import { Application } from "./application.entity";

@Entity()
export class ScheduleItem
{
    @PrimaryGeneratedColumn('uuid')
    scheduleItemId: string;
  
    @Column()
    name: string;
  
    @ManyToOne(() => Block, (block) => block.scheduleItems)
    @JoinColumn({ name: 'blockId' })
    block: Block;
  
    @OneToOne(() => Application)
    @JoinColumn({ name: 'onstageId' })
    application: Application;
  
    @Column()
    order: number;
}