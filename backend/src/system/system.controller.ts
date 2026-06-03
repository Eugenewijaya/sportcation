import { Body, Controller, Get, Post } from '@nestjs/common';
import { ValidationCheckDto } from './dto/validation-check.dto';

@Controller()
export class SystemController {
  @Get()
  getApiRoot() {
    return {
      success: true,
      service: 'sportcation-backend',
      version: '0.1.0',
      apiVersion: 'v1',
      note: 'Backend foundation only. Business APIs are intentionally deferred.'
    };
  }

  @Get('routes')
  getRoutePlaceholders() {
    return {
      success: true,
      basePath: '/api/v1',
      implemented: [
        'GET /api/v1',
        'GET /api/v1/health',
        'GET /api/v1/routes',
        'POST /api/v1/validation-check',
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/otp/request',
        'POST /api/v1/auth/otp/verify',
        'POST /api/v1/auth/logout',
        'GET /api/v1/auth/me',
        'GET /api/v1/users/me'
      ],
      plannedModules: [
        'auth',
        'users',
        'venues',
        'search',
        'slots',
        'bookings',
        'payments',
        'tickets',
        'notifications',
        'vouchers',
        'resell',
        'auctions',
        'wallet'
      ]
    };
  }

  @Post('validation-check')
  checkValidation(@Body() body: ValidationCheckDto) {
    return {
      success: true,
      message: 'Validation pattern accepted the request.',
      data: body
    };
  }
}
