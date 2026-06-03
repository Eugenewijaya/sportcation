import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma, User, UserProfile, UserRole, UserStatus, WalletStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { AuthIdentifier, AuthUserSummary } from './types/auth.types';

type UserWithProfile = User & {
  profile: UserProfile | null;
};

type MemoryUserRecord = AuthUserSummary & {
  identifier: string;
};

@Injectable()
export class AuthUserRepository {
  private readonly memoryUsersById = new Map<string, MemoryUserRecord>();
  private readonly memoryUsersByIdentifier = new Map<string, MemoryUserRecord>();

  constructor(private readonly database: DatabaseService) {}

  async findByIdentifier(identifier: AuthIdentifier): Promise<AuthUserSummary | null> {
    const prisma = this.database.getOptionalClient();

    if (prisma) {
      const user = await prisma.user.findFirst({
        where: identifier.email
          ? { email: identifier.email }
          : { phone: identifier.phone ?? undefined },
        include: { profile: true }
      });

      return user ? this.toSummary(user) : null;
    }

    return this.memoryUsersByIdentifier.get(identifier.normalized) ?? null;
  }

  async findById(userId: string): Promise<AuthUserSummary | null> {
    const prisma = this.database.getOptionalClient();

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      return user ? this.toSummary(user) : null;
    }

    return this.memoryUsersById.get(userId) ?? null;
  }

  async createUser(input: {
    identifier: AuthIdentifier;
    displayName: string;
  }): Promise<AuthUserSummary> {
    const existing = await this.findByIdentifier(input.identifier);

    if (existing) {
      return existing;
    }

    const prisma = this.database.getOptionalClient();

    if (prisma) {
      const user = await prisma.user.create({
        data: {
          authProvider: 'simulation_otp',
          authProviderUserId: input.identifier.providerUserId,
          email: input.identifier.email,
          phone: input.identifier.phone,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
          profile: {
            create: {
              displayName: input.displayName,
              notificationEnabled: true
            }
          },
          wallet: {
            create: {
              balance: 0,
              currency: 'IDR',
              status: WalletStatus.ACTIVE
            }
          }
        },
        include: { profile: true }
      });

      return this.toSummary(user);
    }

    const memoryUser: MemoryUserRecord = {
      id: randomUUID(),
      displayName: input.displayName,
      email: input.identifier.email,
      phone: input.identifier.phone,
      role: 'user',
      status: 'active',
      authProvider: 'simulation_otp',
      city: null,
      avatarUrl: null,
      notificationEnabled: true,
      identifier: input.identifier.normalized
    };

    this.memoryUsersById.set(memoryUser.id, memoryUser);
    this.memoryUsersByIdentifier.set(input.identifier.normalized, memoryUser);

    return memoryUser;
  }

  private toSummary(user: UserWithProfile): AuthUserSummary {
    return {
      id: user.id,
      displayName: user.profile?.displayName ?? 'Sportcation User',
      email: user.email,
      phone: user.phone,
      role: user.role.toLowerCase() as AuthUserSummary['role'],
      status: user.status.toLowerCase() as AuthUserSummary['status'],
      authProvider: user.authProvider,
      city: user.profile?.city ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      notificationEnabled: user.profile?.notificationEnabled ?? true
    };
  }
}
