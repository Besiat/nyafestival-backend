import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ScheduleContainerTimeMode } from '../entity/festival/schedule-container.entity';
import { BlockForScheduleItemForUserDTO } from './block-for-schedule-item-for-user.dto';

export class ScheduleContainerDTO {
    scheduleContainerId: string;
    code: string;
    name: string;
    timeMode: ScheduleContainerTimeMode;
    defaultStartTime?: string;
    order: number;
    blocks: BlockForScheduleItemForUserDTO[];
}

export class UpsertScheduleContainerDTO {
    @ApiProperty({ description: 'Container code', example: 'lecture-hall' })
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty({ description: 'Display name', example: 'Lecture Hall' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Time mode', enum: ['calculated', 'explicit', 'none'] })
    @IsIn(['calculated', 'explicit', 'none'])
    timeMode: ScheduleContainerTimeMode;

    @ApiPropertyOptional({ description: 'Default start time for calculated containers', example: '12:00' })
    @IsOptional()
    @IsString()
    defaultStartTime?: string;

    @ApiProperty({ description: 'Container order', example: 0 })
    @IsNumber()
    order: number;
}
