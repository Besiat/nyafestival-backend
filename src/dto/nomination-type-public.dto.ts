import { ApiProperty } from '@nestjs/swagger';

export class NominationTypePublicDTO {
    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ description: 'Last application day in Moscow, YYYY-MM-DD', example: '2026-11-01' })
    applicationsEndDate: string;

    @ApiProperty()
    showAccepted: boolean;
}
