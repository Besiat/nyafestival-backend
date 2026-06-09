import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FieldType } from '../enums/fieldType';

export class CreateFieldDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ enum: FieldType })
  @IsNotEmpty()
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dependsOn?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxFileSize?: number;
}
