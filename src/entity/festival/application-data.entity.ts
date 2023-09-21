import { PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Field } from "./field.entity";
import { Application } from "./application.entity";

@Entity()
export class ApplicationData {
  @PrimaryGeneratedColumn('uuid')
  applicationDataId: string;

  @ManyToOne(() => Application, (Application) => Application.applicationData)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @ManyToOne(() => Field)
  @JoinColumn({ name: 'fieldId' })
  field: Field;

  @Column({ type: 'text', nullable: true })
  value: string;
}