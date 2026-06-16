import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleItemDTO {
    @ApiProperty({ description: 'Application ID', example: 'someApplicationId' })
    @IsOptional()
    @IsString()
    applicationId?: string;

    @ApiProperty({ description: 'Block ID', example: 'someBlockId' })
    @IsNotEmpty()
    @IsString()
    blockId: string;

    @ApiPropertyOptional({ description: 'Manual item title', example: 'How to draw manga' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Manual item subtitle', example: 'Guest Lecturer' })
    @IsOptional()
    @IsString()
    subtitle?: string;
}
