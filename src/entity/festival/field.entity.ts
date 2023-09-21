import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FieldType } from "../../enums/fieldType";
import { SubNomination } from "./subNomination.entity";

@Entity()
export class Field {
    @PrimaryGeneratedColumn('uuid')
    fieldId: string;

    @Column()
    label: string;

    @Column()
    hint: string;

    @Column()
    code: string;

    @Column({ default: false })
    required: boolean;

    @Column({ type: 'enum', enum: FieldType })
    fieldType: FieldType;

    @OneToMany(() => SubNomination, (subNomination) => subNomination.fields)
    subNominations: SubNomination[];

    @Column()
    order: number;

    @Column({ nullable: true })
    maxFileSize: number;

    @Column({ nullable: true })
    fileExtensions: string;
}