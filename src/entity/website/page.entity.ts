import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Page {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ type: String, description: 'Unique identifier for the page' })
    pageId: string;

    @Column({ default: '' }) // Set default value to an empty string
    @ApiProperty({ type: String, description: 'Title of the page' })
    title: string;

    @Column()
    @ApiProperty({ type: String, description: 'Route of the page' })
    route: string;

    @Column('text')
    @ApiProperty({ type: String, description: 'Content of the page' })
    content: string;

    @Column({ type: 'int', nullable: true })
    @ApiProperty({ type: Number, description: 'Order of the page in the list' })
    order: number;
}
