import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { CurrentUserController } from './current-user.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { AuthUserRepository } from './auth-user.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OtpSessionStore } from './otp-session.store';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, CurrentUserController],
  providers: [
    AuthService,
    AuthTokenService,
    AuthUserRepository,
    JwtAuthGuard,
    OtpSessionStore
  ],
  exports: [AuthService, AuthTokenService, JwtAuthGuard]
})
export class AuthModule {}
