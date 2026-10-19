import { ApiProperty } from "@nestjs/swagger";
import { SubNominationPublicDTO } from "./sub-nomination-public.dto";
import { NominationTypePublicDTO } from "./nomination-type-public.dto";

export class NominationPublicDTO {
    @ApiProperty({ description: 'The ID of the nomination' })
    id: string;

    @ApiProperty({ description: 'The name of the nomination' })
    name: string;

    @ApiProperty({ type: NominationTypePublicDTO, nullable: true })
    nominationType: NominationTypePublicDTO | null;

    @ApiProperty({ description: 'The sub-nominations associated with this nomination', type: [SubNominationPublicDTO] })
    subNominations: SubNominationPublicDTO[];
}
