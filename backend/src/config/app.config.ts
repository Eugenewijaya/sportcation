import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  authTokenSecret: process.env.AUTH_TOKEN_SECRET ?? null,
  authAccessTokenTtlSeconds: Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS ?? 1800),
  authOtpTtlSeconds: Number(process.env.AUTH_OTP_TTL_SECONDS ?? 300),
  authOtpMaxAttempts: Number(process.env.AUTH_OTP_MAX_ATTEMPTS ?? 5),
  authExposeSimulatedOtp: process.env.AUTH_EXPOSE_SIMULATED_OTP !== 'false',
  databaseUrl: process.env.DATABASE_URL ?? null
}));
