// create-block.dto.ts

import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlockDTO {
    @ApiProperty({ description: 'Nomination ID', example: 'someNominationId' })
    @IsOptional()
    @IsString()
    nominationId?: string;

    @ApiPropertyOptional({ description: 'Schedule container ID', example: 'someScheduleContainerId' })
    @IsOptional()
    @IsString()
    scheduleContainerId?: string;

    @ApiProperty({ description: 'Name of the block', example: 'Morning Session' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Order of the block', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    order: number;

    @ApiProperty({ description: 'Duration of the block in seconds', example: 3600 })
    @IsOptional()
    @IsNumber()
    durationInSeconds?: number;

    @ApiPropertyOptional({ description: 'Explicit start time', example: '14:00' })
    @IsOptional()
    @IsString()
    startTime?: string;

    @ApiPropertyOptional({ description: 'Explicit end time', example: '14:30' })
    @IsOptional()
    @IsString()
    endTime?: string;
}
