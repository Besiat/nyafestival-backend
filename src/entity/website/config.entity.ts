import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Config {
    @PrimaryColumn()
    @ApiProperty({ type: 'string', description: 'key of the config' })
    key: string;

    @Column('text')
    @ApiProperty({ type: 'string', description: 'value of the config' })
    value: string;
}