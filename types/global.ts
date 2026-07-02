/**
 * types/global.ts
 * Tipos globais compartilhados entre módulos (não substitui os tipos
 * locais de cada módulo em modules/*\/types.ts).
 */
export type ISODateString = string;

export interface AppUser {
  id: string;
  email: string;
  displayName?: string;
}
