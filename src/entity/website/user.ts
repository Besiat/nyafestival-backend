import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Application } from "../festival/application.entity"
import { IsEmail, IsNotEmpty } from "class-validator";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ nullable: true })
    vkId?: string;

    @Column({ nullable: true })
    nickname?: string;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    password: string;

    @Column({ nullable: true })
    accessToken?: string;

    @Column('bool')
    isAdmin: boolean = false;

    @OneToMany(() => Application, (application) => application.user)
    applications: Application[];

}
