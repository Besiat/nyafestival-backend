import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SubNomination } from './sub-nomination.entity';
import { User } from '../website/user';
import { ApplicationData } from './application-data.entity';
import { ApplicationParticipant } from './application-participant.entity';

@Entity()
export class Application {
    @PrimaryGeneratedColumn('uuid')
    applicationId: string;

    @Column()
    subNominationId: string;

    @ManyToOne(() => SubNomination, subNomination => subNomination.applications)
    @JoinColumn({ name: 'subNominationId' })
    subNomination: SubNomination;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.applications)
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => ApplicationData, applicationData => applicationData.application)
    applicationData: ApplicationData[];

    @OneToMany(() => ApplicationParticipant, participant => participant.application)
    participants: ApplicationParticipant[];

    @Column({ type: 'uuid', nullable: true })
    sourceParticipantId: string | null;

    @ManyToOne(() => ApplicationParticipant)
    @JoinColumn({ name: 'sourceParticipantId' })
    sourceParticipant: ApplicationParticipant | null;

    @Column({ type: 'timestamptz', nullable: true })
    withdrawnAt: Date | null;

    @Column({ nullable: true })
    adminNote?: string | null;

    @Column({ default: 0 })
    state: ApplicationState;

    @Column({ default: '' })
    fullName: string;

    @Column({ nullable: true })
    applicationDate: Date;
}

export enum ApplicationState {
    New = 0,
    Invalid,
    Pending,
    Denied,
    Accepted,
}
