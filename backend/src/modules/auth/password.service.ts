import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { getEnv } from '../../common/config/env.schema';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  async hash(plainPassword: string): Promise<string> {
    const env = getEnv(this.configService);
    return hash(plainPassword, env.bcryptSaltRounds);
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainPassword, passwordHash);
  }
}
