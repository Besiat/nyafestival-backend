import { ApiProperty } from "@nestjs/swagger";
import { Max, Min } from "class-validator";

export class VoteDTO {
    @ApiProperty({ description: 'The ID of the application' })
    applicationId: string;

    @ApiProperty({ description: "Rating" })
    @Min(1)
    @Max(10)
    rating: number;
}