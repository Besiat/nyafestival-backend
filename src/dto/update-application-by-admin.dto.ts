import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApplicationDataDTO } from './application-data.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationParticipantDTO } from './application-participant.dto';

export class UpdateApplicationByAdminDTO {
    @ApiPropertyOptional({ type: [ApplicationParticipantDTO] })
    participants?: ApplicationParticipantDTO[];
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
