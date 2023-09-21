import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SubNomination } from "./subNomination.entity";
import { User } from "../website/user";
import { ApplicationData } from "./application-data.entity";

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  applicationId: string;

  @ManyToOne(() => SubNomination, (subNomination) => subNomination.applications)
  @JoinColumn({ name: 'nominationId' })
  subNomination: SubNomination;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ApplicationData, (applicationData) => applicationData.application)
  applicationData: ApplicationData;

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