import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../website/user";

@Entity()
export class Ticket {
    @PrimaryColumn('numeric')
    ticketNumber: number;

    @Column("uuid", { nullable: true })
    userId?: string;

    @ManyToOne(() => User, (user) => user.tickets)
    @JoinColumn({ name: 'userId' })
    user?: User;
}