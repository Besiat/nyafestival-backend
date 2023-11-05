import { ApiProperty } from "@nestjs/swagger";
import { ApplicationState } from "../entity/festival/application.entity";

export class ApplicationPublicDTO {
    @ApiProperty({ description: 'The ID of the application' })
    id: string;

    @ApiProperty({ description: 'The full name of the application' })
    fullName: string;

    @ApiProperty({ description: 'The status of the application', enum: ApplicationState })
    status: ApplicationState;
}