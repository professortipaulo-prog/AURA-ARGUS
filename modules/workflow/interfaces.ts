/**
 * modules/workflow/interfaces.ts
 */
import type { CreateWorkflowInput, Workflow, WorkflowStatus } from './types';

export interface IWorkflowService {
  plan(input: CreateWorkflowInput): Promise<Workflow>;
  start(workflowId: string): Promise<Workflow>;
  advanceStep(workflowId: string, stepId: string, status: WorkflowStatus, error?: string): Promise<Workflow>;
  monitor(workflowId: string): Promise<Workflow>;
  finalize(workflowId: string): Promise<Workflow>;
}

export interface IWorkflowRepository {
  save(workflow: Workflow): Promise<void>;
  findById(id: string): Promise<Workflow | null>;
  update(workflow: Workflow): Promise<void>;
}
