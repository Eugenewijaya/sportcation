import { AuthenticatedUser } from '../../common/types/authenticated-request';

export type AuthPurpose = 'register' | 'login';

export type AuthIdentifier = {
  type: 'email' | 'phone';
  email: string | null;
  phone: string | null;
  normalized: string;
  providerUserId: string;
  display: string;
};

export type AuthUserSummary = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  role: 'guest' | 'user' | 'partner' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  authProvider: string;
  city: string | null;
  avatarUrl: string | null;
  notificationEnabled: boolean;
};

export type OtpSessionRecord = {
  id: string;
  purpose: AuthPurpose;
  identifier: AuthIdentifier;
  displayName?: string;
  otpHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAtMs: number;
};

export type AccessTokenPayload = AuthenticatedUser & {
  sub: string;
  userId: string;
  exp?: number;
  iat?: number;
};
