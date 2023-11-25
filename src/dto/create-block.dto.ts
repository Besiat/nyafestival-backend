// create-block.dto.ts

import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockDTO {
    @ApiProperty({ description: 'Nomination ID', example: 'someNominationId' })
    @IsNotEmpty()
    @IsString()
    nominationId: string;

    @ApiProperty({ description: 'Name of the block', example: 'Morning Session' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Order of the block', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    order: number;

    @ApiProperty({ description: 'Duration of the block in seconds', example: 3600 })
    @IsNotEmpty()
    @IsNumber()
    durationInSeconds: number;
}
