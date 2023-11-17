import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Nomination } from './nomination.entity';
import { Application } from './application.entity';

@Entity()
export class SubNomination {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  subNominationId: string;

  @ApiProperty({ type: () => Nomination })
  @ManyToOne(() => Nomination, (nomination) => nomination.subNominations)
  @JoinColumn({ name: 'nominationId' })
  nomination: Nomination;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ type: () => Application, isArray: true })
  @OneToMany(() => Application, (application) => application.subNomination)
  applications: Application[];

  @ApiProperty()
  @Column({ default: 0 })
  order: number;
}
