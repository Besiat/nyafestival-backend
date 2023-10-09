import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorator

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' }) // Provide an example value for email
  @IsEmail()
  email: string;

  @ApiProperty() // You can also provide an example value for password if needed
  @IsNotEmpty()
  password: string;
}
