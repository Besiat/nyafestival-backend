import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Nomination } from "./nomination.entity";

@Entity()
export class NominationType {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ type: String, description: 'Unique identifier for the nomination type' })
    nominationTypeId: string;

    @ApiProperty({ type: String, description: 'Code for the nomination type' })
    @Column()
    code: string;

    @Column()
    @ApiProperty({ type: String, description: 'Name of the nomination type' })
    name: string;

    @Column()
    @ApiProperty({ type: String, description: 'Application acception end date' })
    applicationsEndDate: string;

    @Column()
    @ApiProperty({ type: String, description: 'Do participants need to buy a ticket' })
    shouldBuyTicket: boolean;

    @Column()
    @ApiProperty({ type: String, description: 'Show accepted' })
    showAccepted: boolean;

    @OneToMany(() => Nomination, (nomination) => nomination.nominationType)
    nominations: Nomination[];
}
