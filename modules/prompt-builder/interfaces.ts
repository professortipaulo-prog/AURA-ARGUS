/**
 * modules/prompt-builder/interfaces.ts
 */
import type { BuiltPrompt, PromptBuildRequest } from './types';

export interface IPromptBuilderService {
  build(request: PromptBuildRequest): BuiltPrompt;
}
