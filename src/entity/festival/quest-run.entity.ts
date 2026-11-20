import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../website/user';

@Entity()
export class QuestRun {
    @PrimaryColumn('uuid', { primaryKeyConstraintName: 'PK_quest_run' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_quest_run_user' })
    user?: User;

    @PrimaryColumn('varchar', { length: 64, primaryKeyConstraintName: 'PK_quest_run' })
    questId: string;

    @PrimaryColumn('uuid', { primaryKeyConstraintName: 'PK_quest_run' })
    runId: string;

    @CreateDateColumn({ type: 'timestamptz' })
    startConfirmedAt: Date;

    @Column('integer', { default: 0 })
    revision: number;

    @Column('jsonb', { nullable: true })
    snapshot: Record<string, unknown> | null;
}
