import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../website/user";

@Entity()
export class UserQuestProgress {
    @PrimaryGeneratedColumn('uuid')
    userQuestProgressId?: string;

    @Column()
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user?: User;

    @Column({type: 'varchar', length: 64})
    questCode: string;

    @Column({type: 'varchar', length: 64})
    lastStep: string;

}