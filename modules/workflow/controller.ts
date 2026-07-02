/**
 * modules/workflow/controller.ts
 */
import { WorkflowService } from './service';
import type { CreateWorkflowInput } from './types';

const service = new WorkflowService();

export async function planWorkflowHandler(input: CreateWorkflowInput) {
  return service.plan(input);
}

export function getWorkflowService(): WorkflowService {
  return service;
}
