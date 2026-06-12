import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPool,
  type Pool,
  type RowDataPacket,
  type ResultSetHeader,
} from 'mysql2/promise';
import { getEnv } from '../config/env.schema';
import type { DbQueryParam } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const env = getEnv(this.configService);

    this.pool = createPool({
      host: env.mysql.host,
      port: env.mysql.port,
      user: env.mysql.user,
      password: env.mysql.password,
      database: env.mysql.database,
      timezone: 'Z',
      waitForConnections: true,
      connectionLimit: 10,
    });

    const isConnected = await this.ping();
    if (!isConnected) {
      throw new Error('MySQL connectivity check failed on startup');
    }

    this.logger.log('MySQL connection pool initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.logger.log('MySQL connection pool closed');
    }
  }

  async query<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params: DbQueryParam[] = [],
  ): Promise<T> {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  }

  async ping(): Promise<boolean> {
    try {
      await this.query<RowDataPacket[]>('SELECT 1 AS ok');
      return true;
    } catch (error: unknown) {
      this.logger.error('MySQL ping failed', error);
      return false;
    }
  }

  private getPool(): Pool {
    if (!this.pool) {
      throw new Error('MySQL pool is not initialized');
    }

    return this.pool;
  }
}
