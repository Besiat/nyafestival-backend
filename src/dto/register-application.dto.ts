import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationDataDTO } from './application-data.dto';
import { ApplicationParticipantDTO } from './application-participant.dto';

export class RegisterApplicationDTO {
    @ApiPropertyOptional({ type: [ApplicationParticipantDTO] })
    participants?: ApplicationParticipantDTO[];
    @ApiProperty({ description: 'Sub Nomination ID', example: '123' })
    @IsNotEmpty({ message: 'SubNominationId should not be empty' })
    subNominationId: string;

    @ApiProperty({
        description: 'Application Data',
        type: [ApplicationDataDTO],
        example: [{ fieldId: '1', value: 'Value 1' }],
    })
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ApplicationDataDTO)
    applicationData: ApplicationDataDTO[];
}
