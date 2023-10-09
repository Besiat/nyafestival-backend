import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.get<boolean>('isAdmin', context.getHandler());

    if (isAdmin) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      // Check if the user is an admin
      if (user && user.isAdmin) {
        return true;
      }
    }

    return false;
  }
}
