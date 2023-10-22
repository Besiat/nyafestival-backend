import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { FieldType } from "../../enums/fieldType";

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

    @ApiProperty()
    @Column()
    category: string;

    @ApiProperty()
    @Column({ nullable: true })
    dependsOn?: string;

    @ApiProperty()
    @Column()
    order: number;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    maxFileSize?: number;
}
