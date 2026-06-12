import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type Pool,
  type RowDataPacket,
  type ResultSetHeader,
} from 'mysql2/promise';
import type { DbQueryParam } from '../common/database/database.types';

type SchemaMigrationRow = RowDataPacket & {
  version: string;
};

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');
const MIGRATION_FILE_PATTERN = /^(\d{3})_.+\.sql$/;

export class MigrationRunnerService {
  constructor(private readonly pool: Pool) {}

  async run(): Promise<void> {
    const appliedVersions = await this.getAppliedVersions();
    const files = this.listMigrationFiles();
    let appliedCount = 0;

    if (files.length === 0) {
      console.log('No .sql files in migrations/ — nothing to do.');
      return;
    }

    for (const filename of files) {
      const version = this.extractVersion(filename);

      if (appliedVersions.has(version)) {
        continue;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, filename), 'utf8');
      console.log(`Applying migration: ${filename}`);

      const connection = await this.pool.getConnection();

      try {
        await connection.beginTransaction();
        await connection.query(sql);
        await connection.query<ResultSetHeader>(
          'INSERT INTO schema_migrations (version) VALUES (?)',
          [version],
        );
        await connection.commit();
        appliedCount += 1;
        console.log(`Applied OK: ${filename}`);
      } catch (error: unknown) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    if (appliedCount === 0) {
      console.log('Database schema is up to date (no pending migrations).');
    } else {
      console.log(`Finished: applied ${appliedCount} migration(s).`);
    }
  }

  private listMigrationFiles(): string[] {
    if (!existsSync(MIGRATIONS_DIR)) {
      return [];
    }

    return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
      .map((entry) => entry.name)
      .filter((name) => MIGRATION_FILE_PATTERN.test(name))
      .sort((a, b) => a.localeCompare(b));
  }

  private extractVersion(filename: string): string {
    const match = MIGRATION_FILE_PATTERN.exec(filename);
    if (!match) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    return filename.replace(/\.sql$/, '');
  }

  private async getAppliedVersions(): Promise<Set<string>> {
    try {
      const rows = await this.query<SchemaMigrationRow[]>(
        'SELECT version FROM schema_migrations ORDER BY version',
      );

      return new Set(rows.map((row) => row.version));
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ER_NO_SUCH_TABLE'
      ) {
        return new Set();
      }

      throw error;
    }
  }

  private async query<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params: DbQueryParam[] = [],
  ): Promise<T> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as T;
  }
}
