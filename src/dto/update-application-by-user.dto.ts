import { IsNotEmpty } from 'class-validator';
import { ApplicationDataDTO } from './application-data.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationByUserDTO {
    @ApiProperty({ example: 'exampleApplicationId', description: 'The ID of the application' })
    @IsNotEmpty({ message: 'Application ID should not be empty' })
    applicationId: string;

    @ApiPropertyOptional({ example: 'exampleSubNominationId', description: 'The ID of the subnomination' })
    subNominationId: string;

    @ApiPropertyOptional({ type: [ApplicationDataDTO], description: 'An array of application data objects' })
    applicationData: ApplicationDataDTO[];
}
