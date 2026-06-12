import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import type {
  UserEntity,
  UserWithPasswordEntity,
} from './entities/user.entity';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByEmail(email: string): Promise<UserWithPasswordEntity | null> {
    const rows = await this.database.query<UserRow[]>(
      `SELECT id, email, password_hash, full_name, is_active, created_at, updated_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email],
    );

    const row = rows[0];
    return row ? this.mapWithPassword(row) : null;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const rows = await this.database.query<UserRow[]>(
      `SELECT id, email, password_hash, full_name, is_active, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapUser(row) : null;
  }

  async create(
    input: {
      email: string;
      passwordHash: string;
      fullName: string;
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<UserEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES (?, ?, ?)`,
      [input.email, input.passwordHash, input.fullName],
    );

    const rows = await query<UserRow[]>(
      `SELECT id, email, password_hash, full_name, is_active, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load user after insert');
    }

    return this.mapUser(row);
  }

  private mapUser(row: UserRow): UserEntity {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapWithPassword(row: UserRow): UserWithPasswordEntity {
    return {
      ...this.mapUser(row),
      passwordHash: row.password_hash,
    };
  }
}
