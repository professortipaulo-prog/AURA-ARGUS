/**
 * modules/memory/hooks.ts
 * Reservado para o painel "Memória" do dashboard (revisar/editar/
 * exportar/apagar memórias, conforme requisito de controle do usuário).
 * Sem lógica de dados real nesta sprint.
 */
'use client';

export function useUserMemoryPlaceholder() {
  return { records: [], isLoading: false };
}
