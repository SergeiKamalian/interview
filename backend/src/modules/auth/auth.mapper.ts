import type { CompanyEntity } from '../companies/entities/company.entity';
import { CompanyType } from '../companies/types/company.type';
import type { UserEntity } from '../users/entities/user.entity';
import { UserType } from '../users/types/user.type';

export function mapUserToGraphql(user: UserEntity): UserType {
  return {
    id: String(user.id),
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
  };
}

export function mapCompanyToGraphql(company: CompanyEntity): CompanyType {
  return {
    id: String(company.id),
    name: company.name,
    slug: company.slug,
    isActive: company.isActive,
  };
}
