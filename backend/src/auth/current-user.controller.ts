import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class CurrentUserController {
  constructor(private readonly auth: AuthService) {}

  @Get('auth/me')
  @UseGuards(JwtAuthGuard)
  getAuthMe(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getCurrentUser(user);
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  getUsersMe(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getCurrentUser(user);
  }
}
