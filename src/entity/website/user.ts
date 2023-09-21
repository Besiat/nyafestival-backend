import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Application } from "../festival/application.entity"
import { IsEmail } from "class-validator";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column()
    nickname: string;

    @Column()
    @IsEmail()
    email: string;

    @OneToMany(() => Application, (application) => application.user)
    applications: Application[];

}
