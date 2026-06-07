import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SubNomination } from "./sub-nomination.entity";
import { NominationField } from "./nomination-fields.entity";
import { NominationType } from "./nomination-type.entity";

@Entity()
export class Nomination {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ type: String, description: 'Unique identifier for the nomination' })
    nominationId: string;

    @Column()
    @ApiProperty({ type: String, description: 'Name of the nomination' })
    name: string;

    @Column()
    @ApiProperty({ type: String, description: 'Full name template' })
    fullNameTemplate: string;

    @OneToMany(() => SubNomination, (subNomination) => subNomination.nomination)
    subNominations: SubNomination[];

    @OneToMany(() => NominationField, (nominationField) => nominationField.nomination, { cascade: true })
    nominationFields: NominationField[];

    @ManyToOne(() => NominationType, { eager: true })
    @JoinColumn({ name: 'nominationTypeId' })
    @ApiProperty({ type: () => NominationType, description: 'Type of the nomination' })
    nominationType: NominationType;

    @Column({ default: 0 })
    order: number = 0;
}
