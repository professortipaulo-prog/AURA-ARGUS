/**
 * modules/prompt-builder/service.ts
 * Monta o prompt final combinando instruções do sistema, contexto
 * recuperado, restrições de segurança e a mensagem do usuário
 * (Sprint-002 §4.5).
 */
import type { IPromptBuilderService } from './interfaces';
import type { BuiltPrompt, PromptBuildRequest } from './types';
import { DEFAULT_SAFETY_CONSTRAINTS, DEFAULT_EXPECTED_FORMAT } from './constants';
import { formatContextAsText } from './utils';

export class PromptBuilderService implements IPromptBuilderService {
  build(request: PromptBuildRequest): BuiltPrompt {
    const constraints = request.safetyConstraints ?? DEFAULT_SAFETY_CONSTRAINTS;
    const format = request.expectedFormat ?? DEFAULT_EXPECTED_FORMAT;

    const systemPrompt = [
      `Você é ${request.persona.persona === 'aura' ? 'AURA' : 'ARGUS'}.`,
      request.persona.systemInstructions,
      `Tom de comunicação: ${request.persona.tone}.`,
      'Restrições de segurança:',
      ...constraints.map((c) => `- ${c}`),
      `Formato esperado da resposta: ${format}`
    ].join('\n');

    const contextPrompt = formatContextAsText(request.builtContext);

    return {
      systemPrompt,
      contextPrompt,
      userPrompt: request.userMessage
    };
  }
}
