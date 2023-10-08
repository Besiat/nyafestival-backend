import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { randomUUID } from 'crypto';
import { User } from '../entity/website/user';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<void> {
        // Check if the user with the provided email already exists
        const existingUser = await this.userService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new UnauthorizedException('Email is already in use.');
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create the user in the database
        await this.userService.create({
            userId: randomUUID(),
            nickname: '',
            isAdmin: false,
            applications: [],
            ...registerDto,
            vkId: null,
            accessToken: null,
            password: hashedPassword,
        });
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email }; // You can include additional user data in the payload
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async findOrCreateUserFromVk(profile: any, accessToken: string): Promise<User> {
        const existingUser = await this.userService.findByVkId(profile.id);
        
        if (existingUser) {
          // User already exists, update the access token if needed
          existingUser.accessToken = accessToken;
          return this.userService.update(existingUser);
        } else {
          // Create a new user based on VK data
          const newUser = new User();
          newUser.vkId = profile.id;
          newUser.accessToken = accessToken;
          // Set other user properties based on the VK profile
    
          return this.userService.create(newUser);
        }
      }
}
