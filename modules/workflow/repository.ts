/**
 * modules/workflow/repository.ts
 * Sprint 004: implementação em memória. Troca futura para Supabase
 * (tabelas `workflows`, `workflow_steps`) não deve exigir mudança de
 * interface (IWorkflowRepository).
 */
import type { IWorkflowRepository } from './interfaces';
import type { Workflow } from './types';

export class InMemoryWorkflowRepository implements IWorkflowRepository {
  private workflows = new Map<string, Workflow>();

  async save(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, workflow);
  }

  async findById(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) ?? null;
  }

  async update(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, workflow);
  }
}
