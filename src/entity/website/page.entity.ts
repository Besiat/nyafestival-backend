import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Page {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ type: String, description: 'Unique identifier for the page' })
    pageId: string;

    @Column()
    @ApiProperty({ type: String, description: 'Route of the page' })
    route: string;

    @Column('text')
    @ApiProperty({ type: String, description: 'Content of the page' })
    content: string;
}
