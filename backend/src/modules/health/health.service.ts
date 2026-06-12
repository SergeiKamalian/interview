import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseService } from '../../common/database/database.service';
import { RedisService } from '../../common/redis/redis.service';

export type HealthCheckResult = {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  version?: string;
  checks: {
    mysql: 'up' | 'down';
    redis: 'up' | 'down';
  };
};

@Injectable()
export class HealthService {
  private readonly version = this.readAppVersion();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getHealth(): Promise<HealthCheckResult> {
    const [mysqlUp, redisUp] = await Promise.all([
      this.databaseService.ping(),
      this.redisService.ping(),
    ]);

    return {
      status: mysqlUp && redisUp ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: this.version,
      checks: {
        mysql: mysqlUp ? 'up' : 'down',
        redis: redisUp ? 'up' : 'down',
      },
    };
  }

  private readAppVersion(): string | undefined {
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        version?: string;
      };

      return packageJson.version;
    } catch {
      return undefined;
    }
  }
}
