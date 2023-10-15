import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorator

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' }) // Provide an example value for email
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' }) // Provide an example value for name
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' }) // Provide an example value for password
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
