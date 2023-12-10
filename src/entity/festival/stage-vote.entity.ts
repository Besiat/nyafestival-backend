import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StageVote
{
    @PrimaryGeneratedColumn()
    stageVoteId: string;

    @Column()
    applicationId: string;

    @Column()
    userId: string;
}