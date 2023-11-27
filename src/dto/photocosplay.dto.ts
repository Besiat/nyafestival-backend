import { ApiProperty } from '@nestjs/swagger';

export class PhotocosplayDTO {
  @ApiProperty({ description: 'The ID of the application' })
  applicationId: string;

  @ApiProperty({ description: 'The character of the photocosplay' })
  character: string;

  @ApiProperty({ description: 'The fandom of the photocosplay' })
  fandom: string;

  @ApiProperty({ description: 'The photographer of the photocosplay' })
  photographer: string;

  @ApiProperty({ description: 'The cosplayer of the photocosplay' })
  cosplayer: string;

  @ApiProperty({ description: 'The URL of the main image' })
  imageUrl: string;

  @ApiProperty({ description: 'The URL of the first additional photo' })
  photo1Url: string;

  @ApiProperty({ description: 'The URL of the second additional photo' })
  photo2Url: string;

  @ApiProperty({ description: 'The URL of the third additional photo' })
  photo3Url: string;

  @ApiProperty({ description: 'The rating of the photocosplay', required: false })
  rating?: number;
}
