import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApplicationDataDTO } from './application-data.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationByAdminDTO {
    @ApiPropertyOptional({ example: 'exampleSubNominationId', description: 'The ID of the subnomination' })
    subNominationId?: string;

    @ApiPropertyOptional({ type: [ApplicationDataDTO], description: 'An array of application data objects' })
    applicationData?: ApplicationDataDTO[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    recalculateFullName?: boolean;
}
