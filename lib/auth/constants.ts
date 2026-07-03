export const DEFAULT_ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111';
export const DEFAULT_ORGANIZATION_SLUG = 'aura-argus';
export const ADMIN_EMAIL = 'professortipaulo@gmail.com';
export const ADMIN_USERNAME = 'paulofilho';

export function normalizeLoginIdentifier(identifier: string): string {
  const value = identifier.trim().toLowerCase();
  if (value === ADMIN_USERNAME) return ADMIN_EMAIL;
  return value;
}
