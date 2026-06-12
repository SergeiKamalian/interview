import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type HealthCheckResult = {
  status: 'ok';
  uptime: number;
  timestamp: string;
  version?: string;
};

@Injectable()
export class HealthService {
  private readonly version = this.readAppVersion();

  getHealth(): HealthCheckResult {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: this.version,
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
