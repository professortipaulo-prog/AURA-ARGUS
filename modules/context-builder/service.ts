/**
 * modules/context-builder/service.ts
 * Implementa o pipeline descrito em Sprint-002 §4.2/§4.4:
 * memórias/dados -> filtros (usuário, projeto, recência, permissão) ->
 * ranqueamento -> compactação -> contexto aprovado para o Prompt Builder.
 */
import type { IContextBuilderService, IContextDataSource } from './interfaces';
import type { BuiltContext, ContextBuildRequest, MemoryContextFragment } from './types';
import { DEFAULT_MAX_TOKENS, MEMORY_TOKEN_BUDGET_RATIO } from './constants';
import { estimateTokens, sortByRelevance } from './utils';
import { StubContextDataSource } from './repository';

export class ContextBuilderService implements IContextBuilderService {
  constructor(private readonly dataSource: IContextDataSource = new StubContextDataSource()) {}

  async buildContext(request: ContextBuildRequest): Promise<BuiltContext> {
    const maxTokens = request.maxTokens ?? DEFAULT_MAX_TOKENS;

    const [user, project, conversation] = await Promise.all([
      this.dataSource.getUserContext(request.userId),
      request.projectId ? this.dataSource.getProjectContext(request.projectId) : Promise.resolve(null),
      this.dataSource.getConversationContext(request.conversationId)
    ]);

    // Sprint 004: Memory Retrieval ainda não conectado a um banco vetorial
    // real; fragmentos permanecem vazios até a sprint de integração.
    const rawFragments: MemoryContextFragment[] = [];
    const memoryFragments = this.rankAndCompact(rawFragments, Math.floor(maxTokens * MEMORY_TOKEN_BUDGET_RATIO));

    const estimatedTokens =
      memoryFragments.reduce((sum, f) => sum + estimateTokens(f.content), 0) +
      (conversation ? conversation.recentMessages.reduce((s, m) => s + estimateTokens(m.content), 0) : 0);

    return { user, project, conversation, memoryFragments, estimatedTokens };
  }

  rankAndCompact(fragments: MemoryContextFragment[], maxTokens: number): MemoryContextFragment[] {
    const ranked = sortByRelevance(fragments);
    const compacted: MemoryContextFragment[] = [];
    let usedTokens = 0;

    for (const fragment of ranked) {
      const cost = estimateTokens(fragment.content);
      if (usedTokens + cost > maxTokens) break;
      compacted.push(fragment);
      usedTokens += cost;
    }

    return compacted;
  }
}
