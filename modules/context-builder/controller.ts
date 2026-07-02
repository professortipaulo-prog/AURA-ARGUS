/**
 * modules/context-builder/controller.ts
 */
import { ContextBuilderService } from './service';
import type { ContextBuildRequest } from './types';

const service = new ContextBuilderService();

export async function buildContextHandler(request: ContextBuildRequest) {
  return service.buildContext(request);
}

export function getContextBuilderService(): ContextBuilderService {
  return service;
}
