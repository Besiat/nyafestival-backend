import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Nomination } from "./nomination.entity";
import { Field } from "./field.entity";

@Entity({ name: 'nomination_fields' })
export class NominationField {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'nominationId' })
    nominationId: string;

    @ManyToOne(() => Nomination)
    @JoinColumn({ name: 'nominationId' })
    nomination: Nomination;

    @Column({ name: 'fieldId' })
    fieldId: string;

    @ManyToOne(() => Field)
    @JoinColumn({ name: 'fieldId' })
    field: Field;

    @Column({ name: 'order', default: 0 })
    order: number;

}