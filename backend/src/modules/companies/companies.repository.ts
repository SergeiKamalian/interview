import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type { DbQueryParam } from '../../common/database/database.types';
import type {
  CompanyEntity,
  CompanyMembershipRole,
} from './entities/company.entity';

interface CompanyRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

interface MembershipRow extends RowDataPacket {
  company_id: number;
  role: CompanyMembershipRole;
}

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

@Injectable()
export class CompaniesRepository {
  constructor(private readonly database: DatabaseService) {}

  async slugExists(slug: string): Promise<boolean> {
    const rows = await this.database.query<RowDataPacket[]>(
      'SELECT 1 AS found FROM companies WHERE slug = ? LIMIT 1',
      [slug],
    );

    return rows.length > 0;
  }

  async findById(id: number): Promise<CompanyEntity | null> {
    const rows = await this.database.query<CompanyRow[]>(
      `SELECT id, name, slug, is_active, created_at, updated_at
       FROM companies
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapCompany(row) : null;
  }

  async create(
    input: { name: string; slug: string },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<CompanyEntity> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO companies (name, slug)
       VALUES (?, ?)`,
      [input.name, input.slug],
    );

    const rows = await query<CompanyRow[]>(
      `SELECT id, name, slug, is_active, created_at, updated_at
       FROM companies
       WHERE id = ?
       LIMIT 1`,
      [Number(result.insertId)],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load company after insert');
    }

    return this.mapCompany(row);
  }

  async createMembership(
    input: {
      companyId: number;
      userId: number;
      role: CompanyMembershipRole;
    },
    query: QueryFn = (sql, params) => this.database.query(sql, params),
  ): Promise<void> {
    await query<ResultSetHeader>(
      `INSERT INTO company_memberships (company_id, user_id, role)
       VALUES (?, ?, ?)`,
      [input.companyId, input.userId, input.role],
    );
  }

  async findPrimaryMembershipForUser(userId: number): Promise<{
    companyId: number;
    role: CompanyMembershipRole;
  } | null> {
    const rows = await this.database.query<MembershipRow[]>(
      `SELECT company_id, role
       FROM company_memberships
       WHERE user_id = ?
       ORDER BY
         CASE role WHEN 'owner' THEN 0 ELSE 1 END,
         id ASC
       LIMIT 1`,
      [userId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      companyId: row.company_id,
      role: row.role,
    };
  }

  private mapCompany(row: CompanyRow): CompanyEntity {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
