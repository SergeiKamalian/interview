import { Injectable } from '@nestjs/common';
import { CompaniesRepository } from '../companies/companies.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  get users(): UsersRepository {
    return this.usersRepository;
  }

  get companies(): CompaniesRepository {
    return this.companiesRepository;
  }
}
