import { Controller, Post, Body, ValidationPipe, UseGuards, Request, Get } from '@nestjs/common';
import { User } from '../entity/website/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-guard';

@Controller('auth')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<{ message: string }> {
    const user = await this.authService.register(registerDto);
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.login(loginDto);
    return accessToken ;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<User> {
    // This endpoint is protected and requires a valid JWT to access.
    // The user object is available in req.user after successful authentication.
    return req.user;
  }
}
