import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { AuthTokenService } from './auth-token.service';
import { AuthUserRepository } from './auth-user.repository';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpSessionStore } from './otp-session.store';
import { AuthIdentifier, AuthPurpose } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpSessions: OtpSessionStore,
    private readonly tokens: AuthTokenService,
    private readonly users: AuthUserRepository
  ) {}

  async register(body: RegisterDto) {
    const identifier = this.normalizeIdentifier(body);
    const existing = await this.users.findByIdentifier(identifier);

    if (existing) {
      throw new ConflictException({
        code: 'USER_ALREADY_REGISTERED',
        message: 'This email or phone is already registered. Please login instead.'
      });
    }

    return this.createOtpResponse('register', identifier, body.displayName);
  }

  async login(body: LoginDto) {
    const identifier = this.normalizeIdentifier(body);
    const existing = await this.users.findByIdentifier(identifier);

    if (!existing) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'No account was found for this email or phone. Please register first.'
      });
    }

    this.ensureActiveUser(existing.status);

    return this.createOtpResponse('login', identifier);
  }

  async requestOtp(body: OtpRequestDto) {
    if (body.purpose === 'register') {
      if (!body.displayName) {
        throw new BadRequestException({
          code: 'DISPLAY_NAME_REQUIRED',
          message: 'Display name is required for register OTP requests.'
        });
      }

      return this.register({
        displayName: body.displayName,
        email: body.email,
        phone: body.phone
      });
    }

    return this.login({
      email: body.email,
      phone: body.phone
    });
  }

  async verifyOtp(body: VerifyOtpDto) {
    const verifiedSession = this.otpSessions.verify(body.otpSessionId, body.otpCode);
    const user = verifiedSession.purpose === 'register'
      ? await this.users.createUser({
          identifier: verifiedSession.identifier,
          displayName: verifiedSession.displayName ?? 'Sportcation User'
        })
      : await this.users.findByIdentifier(verifiedSession.identifier);

    if (!user) {
      throw new UnauthorizedException({
        code: 'OTP_SESSION_USER_NOT_FOUND',
        message: 'The OTP session is no longer valid for an existing user.'
      });
    }

    this.ensureActiveUser(user.status);

    this.otpSessions.consume(body.otpSessionId);

    const token = await this.tokens.issueAccessToken(user);

    return {
      success: true,
      user,
      token
    };
  }

  async getCurrentUser(user: AuthenticatedUser) {
    const currentUser = await this.users.findById(user.id);

    if (!currentUser) {
      throw new UnauthorizedException({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Authenticated user no longer exists.'
      });
    }

    return {
      success: true,
      user: currentUser
    };
  }

  async logout(request: Request, user: AuthenticatedUser) {
    const token = this.extractBearerToken(request);

    await this.tokens.revokeAccessToken(token);

    return {
      success: true,
      userId: user.id
    };
  }

  private createOtpResponse(
    purpose: AuthPurpose,
    identifier: AuthIdentifier,
    displayName?: string
  ) {
    const session = this.otpSessions.create({
      purpose,
      identifier,
      displayName
    });

    return {
      success: true,
      otpSession: {
        id: session.id,
        purpose,
        expiresAt: session.expiresAt,
        deliveryTarget: identifier.display,
        maxAttempts: session.maxAttempts
      },
      simulation: session.simulatedOtpCode
        ? {
            otpCode: session.simulatedOtpCode,
            note: 'Development-only simulated OTP. Disable AUTH_EXPOSE_SIMULATED_OTP outside local testing.'
          }
        : null
    };
  }

  private normalizeIdentifier(body: { email?: string; phone?: string }): AuthIdentifier {
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim().replace(/\s+/g, '');

    if (!email && !phone) {
      throw new BadRequestException({
        code: 'IDENTIFIER_REQUIRED',
        message: 'Email or phone is required.'
      });
    }

    if (email && phone) {
      throw new BadRequestException({
        code: 'ONLY_ONE_IDENTIFIER_ALLOWED',
        message: 'Use either email or phone, not both.'
      });
    }

    if (email) {
      return {
        type: 'email',
        email,
        phone: null,
        normalized: email,
        providerUserId: `email:${email}`,
        display: maskEmail(email)
      };
    }

    const normalizedPhone = phone ?? '';

    return {
      type: 'phone',
      email: null,
      phone: normalizedPhone,
      normalized: normalizedPhone,
      providerUserId: `phone:${normalizedPhone}`,
      display: maskPhone(normalizedPhone)
    };
  }

  private extractBearerToken(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_REQUIRED',
        message: 'Bearer token is required.'
      });
    }

    return authHeader.slice('Bearer '.length).trim();
  }

  private ensureActiveUser(status: string) {
    if (status !== 'active') {
      throw new UnauthorizedException({
        code: 'USER_NOT_ACTIVE',
        message: 'This account is not active.'
      });
    }
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  const visibleName = name.length <= 2 ? name[0] ?? '*' : `${name.slice(0, 2)}***`;

  return `${visibleName}@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';

  return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
}
