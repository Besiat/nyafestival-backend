import { ApiProperty } from '@nestjs/swagger';

export class VoteViewDTO {
  @ApiProperty({ description: 'The ID of the application' })
  applicationId: string;

  @ApiProperty({description: 'Fields of the application'})
  fields: Record<string,string>;
  
  @ApiProperty({ description: 'The rating of the photocosplay', required: false })
  rating?: number;
}
