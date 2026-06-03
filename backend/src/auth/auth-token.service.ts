import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { AuthUserSummary, AccessTokenPayload } from './types/auth.types';

@Injectable()
export class AuthTokenService {
  private readonly logger = new Logger(AuthTokenService.name);
  private readonly secret: string;
  private readonly ttlSeconds: number;
  private readonly revokedTokenIds = new Map<string, number>();

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService
  ) {
    const configuredSecret = config.get<string>('AUTH_TOKEN_SECRET');
    const nodeEnv = config.get<string>('NODE_ENV', 'development');

    if (!configuredSecret && nodeEnv === 'production') {
      throw new Error('AUTH_TOKEN_SECRET is required in production.');
    }

    if (configuredSecret && configuredSecret.length < 32) {
      throw new Error('AUTH_TOKEN_SECRET must be at least 32 characters.');
    }

    this.secret = configuredSecret ?? randomBytes(32).toString('hex');
    this.ttlSeconds = Number(config.get<string>('AUTH_ACCESS_TOKEN_TTL_SECONDS') ?? 1800);

    if (!configuredSecret) {
      this.logger.warn('AUTH_TOKEN_SECRET is not configured. Using an ephemeral development secret.');
    }
  }

  async issueAccessToken(user: AuthUserSummary) {
    const expiresAtMs = Date.now() + this.ttlSeconds * 1000;
    const payload: AccessTokenPayload = {
      sub: user.id,
      id: user.id,
      userId: user.id,
      sessionId: randomUUID(),
      tokenId: randomUUID(),
      role: user.role,
      authProvider: user.authProvider,
      email: user.email,
      phone: user.phone
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.secret,
      expiresIn: this.ttlSeconds
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.ttlSeconds,
      expiresAt: new Date(expiresAtMs).toISOString()
    };
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    try {
      this.pruneRevokedTokens();
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.secret
      });

      if (this.revokedTokenIds.has(payload.tokenId)) {
        throw new UnauthorizedException({
          code: 'AUTH_TOKEN_REVOKED',
          message: 'Token has been logged out.'
        });
      }

      return {
        id: payload.userId,
        sessionId: payload.sessionId,
        tokenId: payload.tokenId,
        role: payload.role,
        authProvider: payload.authProvider,
        email: payload.email,
        phone: payload.phone
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token is invalid or expired.'
      });
    }
  }

  async revokeAccessToken(token: string) {
    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.secret
    });
    const expiresAtMs = typeof payload.exp === 'number'
      ? payload.exp * 1000
      : Date.now() + this.ttlSeconds * 1000;

    this.revokedTokenIds.set(payload.tokenId, expiresAtMs);
  }

  private pruneRevokedTokens() {
    const now = Date.now();

    for (const [tokenId, expiresAtMs] of this.revokedTokenIds.entries()) {
      if (expiresAtMs <= now) {
        this.revokedTokenIds.delete(tokenId);
      }
    }
  }
}
