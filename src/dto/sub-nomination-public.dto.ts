import { ApiProperty } from "@nestjs/swagger";
import { ApplicationPublicDTO } from "./application-public.dto";

export class SubNominationPublicDTO {
    @ApiProperty({ description: 'The ID of the sub-nomination' })
    id: string;

    @ApiProperty({ description: 'The name of the sub-nomination' })
    name: string;

    @ApiProperty({ description: 'The applications associated with this sub-nomination', type: [ApplicationPublicDTO] })
    applications: ApplicationPublicDTO[];
}