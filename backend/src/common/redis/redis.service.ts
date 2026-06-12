import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { getEnv } from '../config/env.schema';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const env = getEnv(this.configService);
    const password = process.env.REDIS_PASSWORD?.trim();

    this.client = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    await this.client.connect();

    const isConnected = await this.ping();
    if (!isConnected) {
      throw new Error('Redis connectivity check failed on startup');
    }

    this.logger.log('Redis client connected');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.logger.log('Redis client disconnected');
    }
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.getClient().ping();
      return response === 'PONG';
    } catch (error: unknown) {
      this.logger.error('Redis ping failed', error);
      return false;
    }
  }

  private getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }

    return this.client;
  }
}
