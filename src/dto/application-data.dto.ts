import { ApiProperty } from '@nestjs/swagger';

export class ApplicationDataDTO {
    @ApiProperty({ description: 'Field ID', example: '123' })
    fieldId: string;

    @ApiProperty({ description: 'Value', example: 'Some Value' })
    value: string;
}
