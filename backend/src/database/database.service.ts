import { Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly databaseUrl: string | null;
  private client: PrismaClient | null = null;

  constructor(config: ConfigService) {
    this.databaseUrl = config.get<string>('DATABASE_URL') ?? null;
  }

  async onModuleInit() {
    if (!this.databaseUrl) {
      this.logger.warn('DATABASE_URL is not configured. Prisma connection is disabled.');
      return;
    }

    const adapter = new PrismaPg({ connectionString: this.databaseUrl });
    this.client = new PrismaClient({ adapter });

    await this.client.$connect();
    this.logger.log('Prisma connected to PostgreSQL.');
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }

  getClient(): PrismaClient {
    if (!this.client) {
      throw new ServiceUnavailableException({
        code: 'DATABASE_NOT_CONFIGURED',
        message: 'Database connection is not configured.',
        details: {
          requiredEnv: 'DATABASE_URL'
        }
      });
    }

    return this.client;
  }

  getOptionalClient(): PrismaClient | null {
    return this.client;
  }

  getStatus() {
    return {
      provider: 'postgresql',
      configured: Boolean(this.databaseUrl),
      connected: Boolean(this.client),
      orm: 'prisma',
      note: this.client
        ? 'Prisma PostgreSQL client is connected.'
        : 'Set DATABASE_URL to enable the Prisma PostgreSQL connection.'
    };
  }
}
