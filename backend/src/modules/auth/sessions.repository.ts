import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';

export type AuthSessionRow = {
  id: number;
  userId: number;
  refreshTokenHash: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

interface SessionRow extends RowDataPacket {
  id: number;
  user_id: number;
  refresh_token_hash: string;
  user_agent: string | null;
  ip: string | null;
  created_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
}

@Injectable()
export class SessionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async createSession(input: {
    userId: number;
    refreshToken: string;
    userAgent: string | null;
    ip: string | null;
    expiresAt: Date;
  }): Promise<void> {
    const refreshTokenHash = await hash(input.refreshToken, 12);

    await this.database.query<ResultSetHeader>(
      `INSERT INTO auth_sessions (user_id, refresh_token_hash, user_agent, ip, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.userId,
        refreshTokenHash,
        input.userAgent,
        input.ip,
        input.expiresAt,
      ],
    );
  }

  async findMatchingSession(
    userId: number,
    refreshToken: string,
  ): Promise<AuthSessionRow | null> {
    const rows = await this.database.query<SessionRow[]>(
      `SELECT id, user_id, refresh_token_hash, user_agent, ip, created_at, expires_at, revoked_at
       FROM auth_sessions
       WHERE user_id = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
      [userId],
    );

    for (const row of rows) {
      const isMatch = await compare(refreshToken, row.refresh_token_hash);
      if (isMatch) {
        return this.mapSession(row);
      }
    }

    return null;
  }

  async rotateSession(
    sessionId: number,
    refreshToken: string,
    userAgent: string | null,
    ip: string | null,
    expiresAt: Date,
  ): Promise<void> {
    const refreshTokenHash = await hash(refreshToken, 12);

    await this.database.query<ResultSetHeader>(
      `UPDATE auth_sessions
       SET refresh_token_hash = ?, user_agent = ?, ip = ?, expires_at = ?
       WHERE id = ? AND revoked_at IS NULL`,
      [refreshTokenHash, userAgent, ip, expiresAt, sessionId],
    );
  }

  async revokeSession(sessionId: number): Promise<void> {
    await this.database.query<ResultSetHeader>(
      `UPDATE auth_sessions
       SET revoked_at = UTC_TIMESTAMP()
       WHERE id = ? AND revoked_at IS NULL`,
      [sessionId],
    );
  }

  private mapSession(row: SessionRow): AuthSessionRow {
    return {
      id: row.id,
      userId: row.user_id,
      refreshTokenHash: row.refresh_token_hash,
      userAgent: row.user_agent,
      ip: row.ip,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
    };
  }
}
