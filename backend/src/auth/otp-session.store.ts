import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import {
  BadRequestException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthIdentifier, AuthPurpose, OtpSessionRecord } from './types/auth.types';

@Injectable()
export class OtpSessionStore {
  private readonly sessions = new Map<string, OtpSessionRecord>();
  private readonly otpPepper = randomBytes(32).toString('hex');
  private readonly ttlSeconds: number;
  private readonly maxAttempts: number;
  private readonly exposeSimulatedOtp: boolean;
  private readonly nodeEnv: string;

  constructor(config: ConfigService) {
    this.ttlSeconds = Number(config.get<string>('AUTH_OTP_TTL_SECONDS') ?? 300);
    this.maxAttempts = Number(config.get<string>('AUTH_OTP_MAX_ATTEMPTS') ?? 5);
    this.exposeSimulatedOtp = (config.get<string>('AUTH_EXPOSE_SIMULATED_OTP') ?? 'true') !== 'false';
    this.nodeEnv = config.get<string>('NODE_ENV', 'development');
  }

  create(input: {
    purpose: AuthPurpose;
    identifier: AuthIdentifier;
    displayName?: string;
  }) {
    this.pruneExpiredSessions();

    const otpCode = randomInt(100000, 1000000).toString();
    const expiresAtMs = Date.now() + this.ttlSeconds * 1000;
    const session: OtpSessionRecord = {
      id: randomBytes(16).toString('hex'),
      purpose: input.purpose,
      identifier: input.identifier,
      displayName: input.displayName,
      otpHash: this.hashOtp(otpCode),
      attempts: 0,
      maxAttempts: this.maxAttempts,
      expiresAtMs
    };

    this.sessions.set(session.id, session);

    return {
      id: session.id,
      purpose: session.purpose,
      expiresAt: new Date(session.expiresAtMs).toISOString(),
      maxAttempts: session.maxAttempts,
      simulatedOtpCode: this.shouldExposeOtp() ? otpCode : null
    };
  }

  verify(sessionId: string, otpCode: string): OtpSessionRecord {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new BadRequestException({
        code: 'OTP_SESSION_INVALID',
        message: 'OTP session is invalid.'
      });
    }

    if (session.expiresAtMs <= Date.now()) {
      this.sessions.delete(sessionId);
      throw new GoneException({
        code: 'OTP_SESSION_EXPIRED',
        message: 'OTP session has expired. Please request a new OTP.'
      });
    }

    if (session.attempts >= session.maxAttempts) {
      this.sessions.delete(sessionId);
      throw new HttpException({
        code: 'OTP_ATTEMPTS_EXCEEDED',
        message: 'Too many OTP attempts. Please request a new OTP.'
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    session.attempts += 1;

    if (!this.otpMatches(session.otpHash, otpCode)) {
      throw new BadRequestException({
        code: 'OTP_INVALID',
        message: 'OTP code is invalid.'
      });
    }

    return session;
  }

  consume(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  private shouldExposeOtp(): boolean {
    return this.exposeSimulatedOtp && this.nodeEnv !== 'production';
  }

  private hashOtp(otpCode: string): string {
    return createHmac('sha256', this.otpPepper)
      .update(otpCode)
      .digest('hex');
  }

  private otpMatches(storedHash: string, otpCode: string): boolean {
    const currentHash = this.hashOtp(otpCode);
    const storedBuffer = Buffer.from(storedHash, 'hex');
    const currentBuffer = Buffer.from(currentHash, 'hex');

    return storedBuffer.length === currentBuffer.length &&
      timingSafeEqual(storedBuffer, currentBuffer);
  }

  private pruneExpiredSessions() {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAtMs <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
