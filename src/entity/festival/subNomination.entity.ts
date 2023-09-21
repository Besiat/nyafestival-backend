import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Field } from './field.entity';
import { Nomination } from './nomination.entity';
import { Application } from './application.entity';

@Entity()
export class SubNomination {
  @PrimaryGeneratedColumn('uuid')
  subNominationId: string;

  @ManyToOne(() => Nomination, (nomination) => nomination.subNominations)
  @JoinColumn({ name: 'nominationId' })
  nomination: Nomination;

  @Column()
  name: string;

  @OneToMany(() => Field, (field)=>field.subNominations)
  fields: Field[];

  @Column()
  fullNameTemplate: string;

  @OneToMany(()=>Application, (application)=>application.subNomination)
  applications: Application[]; 

}