import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-guard";

@Injectable()
export class AdminGuard extends JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isJwtAuthenticated = super.canActivate(context);

    if (!isJwtAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.isAdmin) {
      return true;
    }

    return false;
  }
}