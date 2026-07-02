export type AuraSession = {
  userId: string;
  email: string;
  role: 'admin' | 'user';
} | null;

export async function getSession(): Promise<AuraSession> {
  return null;
}

export function isAdmin(session: AuraSession): boolean {
  return session?.role === 'admin';
}
