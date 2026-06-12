export function slugifyCompanyName(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return slug.length > 0 ? slug : 'company';
}

export async function generateUniqueCompanySlug(
  companyName: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugifyCompanyName(companyName);
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugExists(candidate)) {
    const suffixPart = `-${suffix}`;
    candidate = `${baseSlug.slice(0, Math.max(1, 64 - suffixPart.length))}${suffixPart}`;
    suffix += 1;
  }

  return candidate;
}
