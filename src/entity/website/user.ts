import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Application } from "../festival/application.entity"
import { IsEmail, IsNotEmpty } from "class-validator";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column()
    vkId: string;

    @Column()
    nickname: string;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    password: string;

    @Column()
    accessToken: string;

    @Column('bool')
    isAdmin: boolean = false;

    @OneToMany(() => Application, (application) => application.user)
    applications: Application[];

}
