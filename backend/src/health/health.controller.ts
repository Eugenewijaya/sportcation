import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  getHealth() {
    return {
      success: true,
      status: 'ok',
      service: 'sportcation-backend',
      timestamp: new Date().toISOString(),
      database: this.database.getStatus()
    };
  }
}
