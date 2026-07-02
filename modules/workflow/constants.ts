/**
 * modules/workflow/constants.ts
 */
export const INITIAL_STATUS: 'planned' = 'planned';
export const TERMINAL_STATUSES: WorkflowStatusList = ['completed', 'failed', 'cancelled'];

type WorkflowStatusList = ('completed' | 'failed' | 'cancelled')[];
