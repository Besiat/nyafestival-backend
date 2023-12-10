import { ApiProperty } from "@nestjs/swagger";

export class StageVoteSummaryDTO {
    @ApiProperty({type:'string'})
    applicationId: string;

    @ApiProperty({type:'number'})
    voteCount: number;
}