import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../website/user";

@Entity()
export class UserQuestProgress {
    @PrimaryGeneratedColumn('uuid')
    userQuestProgressId?: string;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user?: User;

    @Column({type: 'varchar', length: 64})
    questCode: string;

    @Column({type: 'varchar', length: 64})
    lastStep: string;

}