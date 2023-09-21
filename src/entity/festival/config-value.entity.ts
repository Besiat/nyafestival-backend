import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConfigValue{
    @PrimaryGeneratedColumn('uuid')
    configValueId: string;

    @Column()
    code: string;
    
    @Column()
    value: string;
}