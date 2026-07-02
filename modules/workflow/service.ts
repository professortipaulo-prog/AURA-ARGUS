/**
 * modules/workflow/service.ts
 * Ciclo de vida de workflows multi-etapas: planejamento, execução,
 * monitoramento e finalização (Work Package 004, escopo item 7).
 * Não executa nenhuma ação real — isso será responsabilidade do futuro
 * Action Manager (Sprint-002 §5), que poderá consumir este módulo.
 */
import type { IWorkflowRepository, IWorkflowService } from './interfaces';
import type { CreateWorkflowInput, Workflow, WorkflowStatus, WorkflowStep } from './types';
import { INITIAL_STATUS } from './constants';
import { generateStepId, generateWorkflowId, nowISO } from './utils';
import { InMemoryWorkflowRepository } from './repository';

export class WorkflowService implements IWorkflowService {
  constructor(private readonly repository: IWorkflowRepository = new InMemoryWorkflowRepository()) {}

  async plan(input: CreateWorkflowInput): Promise<Workflow> {
    const steps: WorkflowStep[] = input.steps.map((step) => ({
      id: generateStepId(),
      description: step.description,
      status: 'planned',
      requiresConfirmation: step.requiresConfirmation
    }));

    const workflow: Workflow = {
      id: generateWorkflowId(),
      userId: input.userId,
      conversationId: input.conversationId,
      title: input.title,
      status: INITIAL_STATUS,
      steps,
      createdAt: nowISO(),
      updatedAt: nowISO()
    };

    await this.repository.save(workflow);
    return workflow;
  }

  async start(workflowId: string): Promise<Workflow> {
    const workflow = await this.requireWorkflow(workflowId);
    const updated: Workflow = { ...workflow, status: 'in_progress', updatedAt: nowISO() };
    await this.repository.update(updated);
    return updated;
  }

  async advanceStep(
    workflowId: string,
    stepId: string,
    status: WorkflowStatus,
    error?: string
  ): Promise<Workflow> {
    const workflow = await this.requireWorkflow(workflowId);

    const steps = workflow.steps.map((step) => {
      if (step.id !== stepId) return step;
      return {
        ...step,
        status,
        error,
        startedAt: step.startedAt ?? nowISO(),
        completedAt: status === 'completed' || status === 'failed' ? nowISO() : step.completedAt
      };
    });

    const updated: Workflow = { ...workflow, steps, status: 'monitoring', updatedAt: nowISO() };
    await this.repository.update(updated);
    return updated;
  }

  async monitor(workflowId: string): Promise<Workflow> {
    return this.requireWorkflow(workflowId);
  }

  async finalize(workflowId: string): Promise<Workflow> {
    const workflow = await this.requireWorkflow(workflowId);
    const hasFailure = workflow.steps.some((step) => step.status === 'failed');
    const updated: Workflow = {
      ...workflow,
      status: hasFailure ? 'failed' : 'completed',
      updatedAt: nowISO()
    };
    await this.repository.update(updated);
    return updated;
  }

  private async requireWorkflow(workflowId: string): Promise<Workflow> {
    const workflow = await this.repository.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow não encontrado: ${workflowId}`);
    }
    return workflow;
  }
}
