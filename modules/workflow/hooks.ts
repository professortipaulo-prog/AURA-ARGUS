/**
 * modules/workflow/hooks.ts
 * Reservado para o "Action Center" do dashboard, que exibirá o
 * progresso de workflows multi-etapas (planejado, em execução,
 * monitorando, concluído). Sem lógica de dados real nesta sprint.
 */
'use client';

export function useWorkflowStatusPlaceholder() {
  return { workflow: null, isLoading: false };
}
