import { Controller, Post, Body, ValidationPipe, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; // Import Swagger decorators
import { User } from '../entity/website/user';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-guard';
import { ProfileDTO } from '../dto/profile.dto';
import { Throttle } from '@nestjs/throttler';
import { UserService } from '../services/user.service';

@ApiTags('Authentication')
@Controller('api/auth')
export class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) { }

    @Post('register')
    @Throttle({ default: { limit: 1, ttl: 5000 } })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<{ message: string }> {
        await this.authService.register(registerDto);
        return { message: 'User registered successfully' };
    }

    @Post('login')
    @Throttle({ default: { limit: 1, ttl: 5000 } })
    @ApiResponse({ status: 200, description: 'Login successful', type: LoginDto })
    async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<{ accessToken: string }> {
        const accessToken = await this.authService.loginUsingEmail(loginDto);
        return accessToken;
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User profile', type: User })
    async getProfile(@Request() req): Promise<ProfileDTO> {
        const profileDto = new ProfileDTO();
        profileDto.email = req.user.email;
        profileDto.username = req.user.username;
        return profileDto;
    }

    @Post('login-from-vk')
    @Throttle({ default: { limit: 1, ttl: 5000 } })
    @ApiResponse({ status: 200, description: 'Login from VK successful', type: User })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    async loginFromVk(@Body() vkProfile: any, @Request() req): Promise<{ accessToken: string }> {
        // Use the findOrCreateUserFromVk function
        const user = await this.authService.findOrCreateUserFromVk(vkProfile);
        // Return the access token or any other response you need
        return { accessToken: user.accessToken };
    }

    @Post('confirm-email')
    @ApiResponse({ status: 200, description: 'Email confirmed' })
    async confirmEmail(@Body() body): Promise<void> {
        await this.authService.confirmEmail(body?.confirmationCode);
    }


    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('refresh-token')
    @ApiResponse({ status: 200 })
    async refreshToken(@Request() req): Promise<{ accessToken: string }> {
        const newToken = await this.authService.login(req.user);
        return newToken;
    }
}
