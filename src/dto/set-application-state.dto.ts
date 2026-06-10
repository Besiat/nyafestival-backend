import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, NotEquals } from 'class-validator';
import { ApplicationState } from '../entity/festival/application.entity';

export class SetApplicationStateDTO {
    @ApiProperty({ enum: ApplicationState, example: ApplicationState.Pending })
    @IsNotEmpty()
    @IsEnum(ApplicationState)
    @NotEquals(ApplicationState.New, { message: 'Application state cannot be set to New' })
    state: ApplicationState;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    note?: string;
}
