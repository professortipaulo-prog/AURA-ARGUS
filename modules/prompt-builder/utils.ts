/**
 * modules/prompt-builder/utils.ts
 */
import type { BuiltContext } from '../context-builder/types';

export function formatContextAsText(context: BuiltContext): string {
  const parts: string[] = [];

  if (context.user) {
    parts.push(`Usuário: ${JSON.stringify(context.user)}`);
  }
  if (context.project) {
    parts.push(`Projeto: ${JSON.stringify(context.project)}`);
  }
  if (context.memoryFragments.length > 0) {
    const memoryText = context.memoryFragments.map((f) => `- ${f.content}`).join('\n');
    parts.push(`Memória relevante:\n${memoryText}`);
  }
  if (context.conversation && context.conversation.recentMessages.length > 0) {
    const historyText = context.conversation.recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');
    parts.push(`Histórico recente:\n${historyText}`);
  }

  return parts.join('\n\n') || 'Sem contexto adicional disponível.';
}
