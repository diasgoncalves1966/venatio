import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const database = (await this.prisma.isHealthy()) ? 'up' : 'down';

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      service: 'Venatio API',
      checks: {
        database,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
