import { Controller, Post, Body, ValidationPipe, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; // Import Swagger decorators
import { User } from '../entity/website/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-guard';

@ApiTags('Authentication') // Add a tag for this controller
@Controller('api/auth')
export class UserController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    @ApiResponse({ status: 201, description: 'User registered successfully' }) // Define the response for Swagger
    async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<{ message: string }> {
        const user = await this.authService.register(registerDto);
        return { message: 'User registered successfully' };
    }

    @Post('login')
    @ApiResponse({ status: 200, description: 'Login successful', type: LoginDto }) // Define the response for Swagger
    async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<{ accessToken: string }> {
        const accessToken = await this.authService.login(loginDto);
        return accessToken;
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth() // Specify that this endpoint requires Bearer authentication
    @ApiResponse({ status: 200, description: 'User profile', type: User }) // Define the response for Swagger
    async getProfile(@Request() req): Promise<User> {
        // This endpoint is protected and requires a valid JWT to access.
        // The user object is available in req.user after successful authentication.
        return req.user;
    }

    @Post('login-from-vk')
    @ApiResponse({ status: 200, description: 'Login from VK successful', type: User })
    async loginFromVk(@Body() vkProfile: any, @Request() req): Promise<{ accessToken: string }> {
        // Use the findOrCreateUserFromVk function
        const user = await this.authService.findOrCreateUserFromVk(vkProfile);

        // Return the access token or any other response you need
        return { accessToken: user.accessToken };
    }

}
