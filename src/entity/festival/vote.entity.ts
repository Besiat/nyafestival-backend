import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Vote
{
    @PrimaryGeneratedColumn()
    voteId: string;

    @Column()
    applicationId: string;

    @Column()
    rating: number;

    @Column()
    userId: string;
}