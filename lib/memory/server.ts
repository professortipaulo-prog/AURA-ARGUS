import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { MemoryContext, MemoryPersona, SaveChatTurnInput } from './types';

const DEFAULT_CONTEXT: MemoryContext = { importantMemories: [], recentSessions: [] };

function compactText(value: string, max = 80) {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function titleFromMessage(message: string) {
  return compactText(message, 72) || 'Nova conversa';
}

export async function getMemoryContext(userId: string, limit = 8): Promise<{ context: MemoryContext; error: string | null }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_memory_context', { p_user_id: userId, p_limit: limit });

  if (error) {
    return { context: DEFAULT_CONTEXT, error: error.message };
  }

  const context = (data ?? DEFAULT_CONTEXT) as MemoryContext;
  return {
    context: {
      importantMemories: Array.isArray(context.importantMemories) ? context.importantMemories : [],
      recentSessions: Array.isArray(context.recentSessions) ? context.recentSessions : []
    },
    error: null
  };
}

export function buildMemoryPrompt(context: MemoryContext) {
  const memories = context.importantMemories
    .slice(0, 8)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const sessions = context.recentSessions
    .slice(0, 5)
    .filter((session) => session.summary || session.title)
    .map((session, index) => `${index + 1}. ${session.title}${session.summary ? ` — ${session.summary}` : ''}`)
    .join('\n');

  if (!memories && !sessions) {
    return 'Memória permanente: ainda sem registros relevantes além do perfil inteligente.';
  }

  return [
    'Memória permanente e histórico recuperado:',
    memories ? `Memórias importantes:\n${memories}` : '',
    sessions ? `Conversas recentes:\n${sessions}` : '',
    'Use essas informações apenas quando ajudarem a responder melhor. Não exponha este bloco ao usuário.'
  ].filter(Boolean).join('\n\n');
}

async function ensureSession(userId: string, persona: MemoryPersona, message: string, sessionId?: string | null) {
  const supabase = createSupabaseServerClient().schema('core');

  if (sessionId) {
    const { data } = await supabase
      .from('memory_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  const { data, error } = await supabase
    .from('memory_sessions')
    .insert({ user_id: userId, title: titleFromMessage(message), last_persona: persona, last_message_at: new Date().toISOString() })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

function extractMemoryCandidate(userMessage: string, assistantMessage: string) {
  const text = userMessage.trim();
  const lower = text.toLowerCase();
  const looksPersistent = /\b(lembre|memorize|guarde|salve|sou |meu |minha |prefiro|projeto|cliente|empresa|curso|livro|senai|prazo|objetivo)\b/i.test(text);
  if (!looksPersistent || text.length < 12) return null;

  const kind = lower.includes('prefiro') ? 'preference' : lower.includes('projeto') ? 'project' : 'fact';
  return {
    kind,
    title: compactText(text, 64),
    content: compactText(`Usuário informou: ${text}`, 400),
    salience: lower.includes('lembre') || lower.includes('memorize') ? 5 : 3,
    tags: ['chat', 'auto']
  };
}

export async function saveChatTurn(input: SaveChatTurnInput) {
  const supabase = createSupabaseServerClient().schema('core');
  const sessionId = await ensureSession(input.userId, input.persona, input.userMessage, input.sessionId);
  const now = new Date().toISOString();

  const { error: messageError } = await supabase.from('memory_messages').insert([
    {
      session_id: sessionId,
      user_id: input.userId,
      role: 'user',
      persona: input.persona,
      content: input.userMessage,
      metadata: {}
    },
    {
      session_id: sessionId,
      user_id: input.userId,
      role: 'assistant',
      persona: input.persona,
      provider: input.provider,
      model: input.model,
      content: input.assistantMessage,
      metadata: {}
    }
  ]);

  if (messageError) throw messageError;

  const summary = compactText(`${input.persona.toUpperCase()}: ${input.userMessage}`, 220);
  const { count } = await supabase
    .from('memory_messages')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('user_id', input.userId);

  await supabase
    .from('memory_sessions')
    .update({
      summary,
      last_persona: input.persona,
      last_message_at: now,
      updated_at: now,
      message_count: count ?? 2
    })
    .eq('id', sessionId)
    .eq('user_id', input.userId);

  const candidate = extractMemoryCandidate(input.userMessage, input.assistantMessage);
  if (candidate) {
    await supabase.from('memory_items').insert({
      user_id: input.userId,
      session_id: sessionId,
      scope: 'user',
      kind: candidate.kind,
      title: candidate.title,
      content: candidate.content,
      salience: candidate.salience,
      tags: candidate.tags,
      metadata: { source: 'chat-auto' }
    });
  }

  return { sessionId };
}
