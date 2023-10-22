import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SubNomination } from "./sub-nomination.entity";
import { Field } from "./field.entity";
import { NominationField } from "./nomination-fields.entity";

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
}
