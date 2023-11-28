import { ApiProperty } from '@nestjs/swagger';

export class VotingSummaryDTO {
    @ApiProperty({ description: 'The ID of the application' })
    applicationId: string;

    @ApiProperty({ description: 'The average rating of the photocosplay', required: false })
    rating: number;

    @ApiProperty({ description: 'vote count' })
    voteCount: number;

    @ApiProperty({ description: 'Full name of the application' })
    fullName: string;
}
