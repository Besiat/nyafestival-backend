import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Application } from './application.entity';

@Entity()
export class ApplicationParticipant {
    @PrimaryColumn('uuid')
    participantId: string;

    @Column('uuid')
    applicationId: string;

    @ManyToOne(() => Application, application => application.participants)
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column({ type: 'varchar', nullable: true })
    lastName: string | null;

    @Column({ type: 'varchar', nullable: true })
    firstName: string | null;

    @Column({ type: 'varchar', nullable: true })
    middleName: string | null;

    @Column({ default: 0 })
    order: number;

    @Column({ type: 'timestamptz', nullable: true })
    removedAt: Date | null;
}
