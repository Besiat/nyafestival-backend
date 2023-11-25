import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleItemDTO {
    @ApiProperty({ description: 'Application ID', example: 'someApplicationId' })
    @IsNotEmpty()
    @IsString()
    applicationId: string;

    @ApiProperty({ description: 'Block ID', example: 'someBlockId' })
    @IsNotEmpty()
    @IsString()
    blockId: string;
}
