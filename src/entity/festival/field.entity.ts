import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { FieldType } from "../../enums/fieldType";
import { SubNomination } from "./sub-nomination.entity";
import { FieldCategory } from "../../enums/fieldCategory";

@Entity()
export class Field {
    @PrimaryGeneratedColumn('uuid')
    fieldId: string;

    @ApiProperty()
    @Column()
    label: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    subtitle: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    code: string;

    @ApiProperty()
    @Column({ default: false })
    required: boolean;

    @ApiProperty({ enum: FieldType })
    @Column({ type: 'enum', enum: FieldType })
    type: FieldType;

    @ApiProperty({ enum: FieldCategory })
    @Column({ type: 'enum', enum: FieldCategory })
    category: FieldCategory;

    @ApiProperty()
    @Column({nullable: true})
    dependsOn?: string;

    @ApiProperty()
    @Column()
    order: number;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    maxFileSize?: number;
}
