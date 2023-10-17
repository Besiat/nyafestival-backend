import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../services/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: `${process.env.TOKEN_SECRET}`,
        });
    }

    async validate(payload: any) {
        // The payload parameter will contain the decoded JWT token.
        // You can add custom logic here to validate the user based on the payload.

        // For example, you might want to check if the user exists in your database.
        // Replace this with your actual user lookup logic.
        const user =await this.userService.findById(payload.userId);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}