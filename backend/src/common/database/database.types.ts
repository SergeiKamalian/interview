import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type DbQueryParam = string | number | boolean | Date | Buffer | null;

export type DbQueryResult = RowDataPacket[] | ResultSetHeader;
