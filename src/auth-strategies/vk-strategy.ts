import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-vkontakte';
import { AuthService } from '../services/auth.service';

@Injectable()
export class VkStrategy extends PassportStrategy(Strategy, 'vkontakte') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.VK_CLIENT_ID,
      clientSecret: process.env.VK_SECRET_KEY,
      callbackURL: process.env.VK_REDIRECT_URL
    });
  }

  async validate(accessToken: string, refreshToken: string, params: any, profile: any) {
    // Here, you should implement your validation logic.
    // You can use the 'profile' and 'params' data to create or retrieve a user.

    // Example:
    const user = await this.authService.findOrCreateUserFromVk(profile, accessToken);

    return user;
  }
}
