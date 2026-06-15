import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicTokenService {
  generate(): string {
    return randomUUID();
  }

  mask(token: string): string {
    if (token.length <= 8) {
      return '***';
    }

    return `${token.slice(0, 4)}…${token.slice(-4)}`;
  }
}
