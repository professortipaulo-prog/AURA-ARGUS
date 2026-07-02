/**
 * modules/prompt-builder/controller.ts
 */
import { PromptBuilderService } from './service';
import type { PromptBuildRequest } from './types';

const service = new PromptBuilderService();

export function buildPromptHandler(request: PromptBuildRequest) {
  return service.build(request);
}

export function getPromptBuilderService(): PromptBuilderService {
  return service;
}
