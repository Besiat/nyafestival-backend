import { ApiProperty } from "@nestjs/swagger";
import { SubNomination } from "../entity/festival/sub-nomination.entity";
import { SubNominationPublicDTO } from "./sub-nomination-public.dto";

export class NominationPublicDTO {
    @ApiProperty({ description: 'The ID of the nomination' })
    id: string;

    @ApiProperty({ description: 'The name of the nomination' })
    name: string;

    @ApiProperty({ description: 'The sub-nominations associated with this nomination', type: [SubNomination] })
    subNominations: SubNominationPublicDTO[];
}