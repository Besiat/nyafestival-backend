import { ApplicationDataDTO } from "./application-data.dto";
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationDTO {
    @ApiProperty({ example: 'exampleApplicationId', description: 'The ID of the application' })
    applicationId: string;

    @ApiProperty({ type: [ApplicationDataDTO], description: 'An array of application data objects' })
    applicationData: ApplicationDataDTO[];
}
