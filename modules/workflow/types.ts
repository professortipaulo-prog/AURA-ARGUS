/**
 * modules/workflow/types.ts
 * Workflow Engine (estrutura) — planejamento, execução, monitoramento
 * e finalização de tarefas multi-etapas (Work Package 004, escopo item 7).
 * Base para o futuro Action Manager (Sprint-002 §5).
 */
export type WorkflowStatus =
  | 'planned'
  | 'in_progress'
  | 'monitoring'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowStep {
  id: string;
  description: string;
  status: WorkflowStatus;
  requiresConfirmation: boolean;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface Workflow {
  id: string;
  userId: string;
  conversationId?: string;
  title: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowInput {
  userId: string;
  conversationId?: string;
  title: string;
  steps: Array<Pick<WorkflowStep, 'description' | 'requiresConfirmation'>>;
}
