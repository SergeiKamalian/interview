import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getEnv } from '../../common/config/env.schema';
import { CompaniesRepository } from '../companies/companies.repository';
import { UsersRepository } from '../users/users.repository';
import { AuthContextService } from './auth-context.service';
import { AuthRepository } from './auth.repository';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { RestAuthGuard } from './guards/rest-auth.guard';
import { AuthJwtService } from './jwt.service';
import { SessionsRepository } from './sessions.repository';
import { PasswordService } from './password.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = getEnv(configService);

        return {
          secret: env.jwtSecret,
          signOptions: {
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    AuthRepository,
    UsersRepository,
    CompaniesRepository,
    SessionsRepository,
    PasswordService,
    AuthJwtService,
    AuthContextService,
    GqlAuthGuard,
    RestAuthGuard,
    AuthResolver,
  ],
  exports: [AuthService, GqlAuthGuard, RestAuthGuard],
})
export class AuthModule {}
