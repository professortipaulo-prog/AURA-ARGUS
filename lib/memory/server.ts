import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ImportantMemory, MemoryContext, MemoryPersona, SaveChatTurnInput } from './types';

const DEFAULT_CONTEXT: MemoryContext = {
  project: null,
  projectMemories: [],
  importantMemories: [],
  relevantMemories: [],
  recentSessions: []
};

function compactText(value: string, max = 80) {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function titleFromMessage(message: string) {
  return compactText(message, 72) || 'Nova conversa';
}

function tokenizeQuery(query?: string | null) {
  if (!query) return [];
  const stopwords = new Set([
    'para', 'como', 'com', 'uma', 'uns', 'dos', 'das', 'que', 'por', 'pra', 'sobre', 'isso', 'esse', 'essa',
    'meu', 'minha', 'qual', 'quem', 'onde', 'quando', 'aura', 'argus', 'voce', 'você', 'pode', 'fazer'
  ]);
  return Array.from(new Set(query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !stopwords.has(word))));
}

function scoreMemory(memory: { title: string; content: string; tags?: string[]; salience?: number }, terms: string[]) {
  if (!terms.length) return 0;
  const haystack = `${memory.title} ${memory.content} ${(memory.tags ?? []).join(' ')}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const matches = terms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
  return matches * 10 + (memory.salience ?? 0);
}

function normalizeContext(data: any): MemoryContext {
  const context = (data ?? DEFAULT_CONTEXT) as Partial<MemoryContext>;
  return {
    project: context.project ?? null,
    projectMemories: Array.isArray(context.projectMemories) ? context.projectMemories : [],
    importantMemories: Array.isArray(context.importantMemories) ? context.importantMemories : [],
    relevantMemories: Array.isArray(context.relevantMemories) ? context.relevantMemories : [],
    recentSessions: Array.isArray(context.recentSessions) ? context.recentSessions : []
  };
}

function rankRelevant(context: MemoryContext, query?: string | null): MemoryContext {
  const terms = tokenizeQuery(query);
  if (!terms.length) return context;

  const combined = [...context.projectMemories, ...context.importantMemories];
  const seen = new Set<string>();
  const relevantMemories = combined
    .filter((memory) => {
      if (seen.has(memory.id)) return false;
      seen.add(memory.id);
      return true;
    })
    .map((memory) => ({ memory, score: scoreMemory(memory, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.memory);

  return { ...context, relevantMemories };
}

export async function getMemoryContext(
  userId: string,
  limit = 8,
  query?: string | null,
  projectId?: string | null
): Promise<{ context: MemoryContext; error: string | null }> {
  const supabase = createSupabaseServerClient();

  const rpcName = projectId ? 'get_project_memory_context' : 'get_memory_context';
  const rpcArgs = projectId
    ? { p_user_id: userId, p_project_id: projectId, p_limit: limit }
    : { p_user_id: userId, p_limit: limit };

  const { data, error } = await supabase.rpc(rpcName, rpcArgs as any);

  if (error) {
    return { context: DEFAULT_CONTEXT, error: error.message };
  }

  return { context: rankRelevant(normalizeContext(data), query), error: null };
}

export function buildMemoryPrompt(context: MemoryContext) {
  const projectHeader = context.project
    ? `Projeto ativo: ${context.project.name}${context.project.description ? ` — ${context.project.description}` : ''}`
    : '';

  const relevant = context.relevantMemories
    .slice(0, 6)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const projectMemories = context.projectMemories
    .filter((item) => !context.relevantMemories.some((relevantItem) => relevantItem.id === item.id))
    .slice(0, 7)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const memories = context.importantMemories
    .filter((item) => !context.relevantMemories.some((relevantItem) => relevantItem.id === item.id))
    .slice(0, 5)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const sessions = context.recentSessions
    .slice(0, 5)
    .filter((session) => session.summary || session.title)
    .map((session, index) => `${index + 1}. ${session.title}${session.summary ? ` — ${session.summary}` : ''}`)
    .join('\n');

  if (!projectHeader && !relevant && !projectMemories && !memories && !sessions) {
    return 'Memória permanente: ainda sem registros relevantes além do perfil inteligente.';
  }

  return [
    'Memória permanente, memória de projeto e histórico recuperado:',
    projectHeader,
    relevant ? `Memórias mais relevantes para esta solicitação:\n${relevant}` : '',
    projectMemories ? `Memórias do projeto ativo:\n${projectMemories}` : '',
    memories ? `Memórias permanentes do usuário:\n${memories}` : '',
    sessions ? `Conversas recentes deste contexto:\n${sessions}` : '',
    'Use essas informações apenas quando ajudarem a responder melhor. Não exponha este bloco ao usuário.'
  ].filter(Boolean).join('\n\n');
}

async function ensureSession(
  userId: string,
  persona: MemoryPersona,
  message: string,
  sessionId?: string | null,
  projectId?: string | null
) {
  const supabase = createSupabaseServerClient().schema('core');

  if (sessionId) {
    let query = supabase
      .from('memory_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (projectId) query = query.eq('project_id', projectId);

    const { data } = await query.maybeSingle();
    if (data?.id) return data.id as string;
  }

  const { data, error } = await supabase
    .from('memory_sessions')
    .insert({
      user_id: userId,
      project_id: projectId ?? null,
      title: titleFromMessage(message),
      last_persona: persona,
      last_message_at: new Date().toISOString(),
      metadata: projectId ? { projectId } : {}
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

function extractMemoryCandidate(userMessage: string, assistantMessage: string, projectId?: string | null) {
  const text = userMessage.trim();
  const lower = text.toLowerCase();
  const looksPersistent = /\b(lembre|memorize|guarde|salve|sou |meu |minha |prefiro|projeto|cliente|empresa|curso|livro|senai|prazo|objetivo|decisão|decisao|definimos|aprovado)\b/i.test(text);
  if (!looksPersistent || text.length < 12) return null;

  let kind: ImportantMemory['kind'] = 'fact';
  if (lower.includes('prefiro')) kind = 'preference';
  else if (lower.includes('projeto')) kind = 'project';
  else if (lower.includes('decisão') || lower.includes('decisao') || lower.includes('definimos') || lower.includes('aprovado')) kind = 'decision';

  return {
    kind,
    scope: projectId ? 'project' : 'user',
    title: compactText(text, 64),
    content: compactText(`Usuário informou: ${text}`, 450),
    salience: lower.includes('lembre') || lower.includes('memorize') || kind === 'decision' ? 5 : 3,
    tags: projectId ? ['chat', 'auto', 'project'] : ['chat', 'auto']
  };
}

export async function saveChatTurn(input: SaveChatTurnInput) {
  const supabase = createSupabaseServerClient().schema('core');
  const sessionId = await ensureSession(input.userId, input.persona, input.userMessage, input.sessionId, input.projectId);
  const now = new Date().toISOString();

  const { error: messageError } = await supabase.from('memory_messages').insert([
    {
      session_id: sessionId,
      user_id: input.userId,
      role: 'user',
      persona: input.persona,
      content: input.userMessage,
      metadata: input.projectId ? { projectId: input.projectId } : {}
    },
    {
      session_id: sessionId,
      user_id: input.userId,
      role: 'assistant',
      persona: input.persona,
      provider: input.provider,
      model: input.model,
      content: input.assistantMessage,
      metadata: input.projectId ? { projectId: input.projectId } : {}
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
      project_id: input.projectId ?? null,
      last_persona: input.persona,
      last_message_at: now,
      updated_at: now,
      message_count: count ?? 2
    })
    .eq('id', sessionId)
    .eq('user_id', input.userId);

  const candidate = extractMemoryCandidate(input.userMessage, input.assistantMessage, input.projectId);
  if (candidate) {
    await supabase.from('memory_items').insert({
      user_id: input.userId,
      session_id: sessionId,
      project_id: input.projectId ?? null,
      scope: candidate.scope,
      kind: candidate.kind,
      title: candidate.title,
      content: candidate.content,
      salience: candidate.salience,
      tags: candidate.tags,
      metadata: { source: 'chat-auto', projectId: input.projectId ?? null }
    });
  }

  if (input.projectId) {
    await supabase.from('project_timeline').insert({
      project_id: input.projectId,
      user_id: input.userId,
      event_type: 'chat_turn',
      title: compactText(input.userMessage, 96),
      description: summary,
      metadata: { persona: input.persona, sessionId }
    });
  }

  return { sessionId };
}
