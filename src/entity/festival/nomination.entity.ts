import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SubNomination } from './subNomination.entity';

@Entity()
export class Nomination {
    @PrimaryGeneratedColumn('uuid')
    nominationId: string;

    @Column()
    name: string;

    @Column()
    fullNameTemplate: string;

    @OneToMany(() => SubNomination, (subNomination) => subNomination.nomination)
    subNominations: SubNomination[]
}