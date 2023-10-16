import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Application } from "../festival/application.entity"
import { IsEmail, IsNotEmpty } from "class-validator";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ nullable: true })
    vkId?: string;

    @Column()
    username: string;

    @Column({nullable: true})
    @IsEmail()
    email: string;

    @Column({nullable: true})
    password: string;

    @Column({ nullable: true })
    accessToken?: string;

    @Column('bool')
    isAdmin: boolean = false;

    @OneToMany(() => Application, (application) => application.user)
    applications: Application[];

    @Column({nullable:true})
    emailConfirmationToken?: string;

    @Column('bool')
    confirmed: boolean;

}
