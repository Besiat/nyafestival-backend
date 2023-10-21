import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { SubNomination } from "./sub-nomination.entity";
import { User } from "../website/user";
import { ApplicationData } from "./application-data.entity";

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  applicationId: string;

  @ManyToOne(() => SubNomination, (subNomination) => subNomination.applications)
  @JoinColumn({ name: 'subNominationId' })
  subNomination: SubNomination;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ApplicationData, (applicationData) => applicationData.application)
  applicationData: ApplicationData[];

  @Column()
  verified: boolean;

  @Column()
  accepted: AcceptedState;
}

export enum AcceptedState {
  Uncertain = 0,
  Denied,
  Accepted,
}