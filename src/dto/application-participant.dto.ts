import { ApplicationDataDTO } from './application-data.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplementaryApplicationDTO {
    @ApiPropertyOptional()
    applicationId?: string;
    @ApiProperty()
    subNominationId: string;
    @ApiProperty()
    active: boolean;
    @ApiPropertyOptional({ type: [ApplicationDataDTO] })
    applicationData?: ApplicationDataDTO[];
}

export class ApplicationParticipantDTO {
    @ApiProperty()
    participantId: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    middleName: string;
    @ApiPropertyOptional({ type: [SupplementaryApplicationDTO] })
    supplementaryApplications?: SupplementaryApplicationDTO[];
}
