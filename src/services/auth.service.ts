import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { randomUUID } from 'crypto';
import { User } from '../entity/website/user';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService
    ) { }

    async register(registerDto: RegisterDto): Promise<void> {
        // Check if the user with the provided email already exists
        const existingUser = await this.userService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new BadRequestException('Указанный Email уже используется');
        }

        if (registerDto.password.length<6)
        {
            throw new BadRequestException('Email должен содержать хотя бы 6 символов');
        }

        if (!this.validateEmail(registerDto.email)){
            throw new BadRequestException('Введён некорректный Email');
        }
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const emailConfirmationToken = randomUUID();

        // Create the user in the database
        await this.userService.create({
            userId: randomUUID(),
            username: '',
            isAdmin: false,
            applications: [],
            ...registerDto,
            vkId: null,
            accessToken: null,
            password: hashedPassword,
            emailConfirmationToken,
            confirmed: false
        });

        this.emailService.sendConfirmationEmail(registerDto.email,emailConfirmationToken);
    }

    async login(user: any) {
        const payload = { userId: user.userId, username: user.username }; // You can include additional user data in the payload
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async findOrCreateUserFromVk(profile: any): Promise<User> {
        if (!profile.uid) return null;
        let existingUser = await this.userService.findByVkId(profile.uid);
        if (!existingUser)
        {
            const newUser = new User();
            newUser.vkId = profile.uid;
            newUser.username = `${profile.first_name} ${profile.last_name}`;
            newUser.confirmed = true;
            existingUser = await this.userService.create(newUser);
        }

        // User already exists, update the access token if needed
        const { accessToken } = await this.login(existingUser);
        existingUser.accessToken = accessToken;
        return this.userService.update(existingUser);
    }

    async confirmEmail(confirmationCode: string) : Promise<void> {
        if (!confirmationCode) throw new BadRequestException("Код подтверждения пуст");
        const user = await this.userService.findByConfirmationCode(confirmationCode);
        if (!user) throw new BadRequestException("Неверный код подтверждения");
        user.confirmed = true;
        await this.userService.update(user);
    }

    private validateEmail(email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };
}

