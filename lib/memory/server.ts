import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ImportantMemory, MemoryContext, MemoryPersona, SaveChatTurnInput } from './types';

const DEFAULT_CONTEXT: MemoryContext = {
  project: null,
  projectMemories: [],
  importantMemories: [],
  relevantMemories: [],
  recentSessions: []
};

type MemoryCandidate = {
  kind: ImportantMemory['kind'];
  scope: 'user' | 'project' | 'session' | 'organization';
  title: string;
  content: string;
  salience: number;
  tags: string[];
};

function compactText(value: string, max = 80) {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function titleFromMessage(message: string) {
  return compactText(message, 72) || 'Nova conversa';
}

function stripAccents(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenizeQuery(query?: string | null) {
  if (!query) return [];
  const stopwords = new Set([
    'para', 'como', 'com', 'uma', 'uns', 'dos', 'das', 'que', 'por', 'pra', 'sobre', 'isso', 'esse', 'essa',
    'meu', 'minha', 'qual', 'quem', 'onde', 'quando', 'aura', 'argus', 'voce', 'você', 'pode', 'fazer',
    'projeto', 'deste', 'neste', 'dessa', 'deste', 'etapa'
  ]);
  return Array.from(new Set(stripAccents(query)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !stopwords.has(word))));
}

function scoreMemory(memory: { title: string; content: string; tags?: string[]; salience?: number }, terms: string[]) {
  if (!terms.length) return 0;
  const haystack = stripAccents(`${memory.title} ${memory.content} ${(memory.tags ?? []).join(' ')}`);
  const matches = terms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
  return matches * 10 + (memory.salience ?? 0);
}

function normalizeMemoryItem(item: any): ImportantMemory | null {
  if (!item) return null;
  const id = String(item.id ?? Math.random());
  const kind = String(item.kind ?? item.type ?? item.memoryType ?? 'note');
  const title = String(item.title ?? item.kind ?? item.type ?? 'Memória');
  const content = String(item.content ?? item.description ?? '');
  if (!content.trim() && !title.trim()) return null;
  return {
    id,
    kind,
    title: compactText(title, 120),
    content: content.trim() || compactText(title, 400),
    salience: Number(item.salience ?? 3),
    tags: Array.isArray(item.tags) ? item.tags : [],
    projectId: item.projectId ?? item.project_id ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? item.createdAt ?? item.created_at ?? null
  };
}

function normalizeSession(item: any) {
  return {
    id: String(item.id),
    title: String(item.title ?? 'Conversa'),
    summary: item.summary ?? null,
    messageCount: Number(item.messageCount ?? item.message_count ?? 0),
    lastPersona: item.lastPersona ?? item.last_persona ?? null,
    lastMessageAt: item.lastMessageAt ?? item.last_message_at ?? null,
    projectId: item.projectId ?? item.project_id ?? null
  };
}

function normalizeProject(project: any) {
  if (!project) return null;
  return {
    id: String(project.id),
    name: String(project.name ?? project.title ?? 'Projeto'),
    slug: String(project.slug ?? 'projeto'),
    description: project.description ?? null,
    memoryCount: Number(project.memoryCount ?? project.memory_count ?? 0),
    sessionCount: Number(project.sessionCount ?? project.session_count ?? 0)
  };
}

function normalizeContext(data: any): MemoryContext {
  const context = (data ?? DEFAULT_CONTEXT) as any;
  const projectMemoriesRaw = context.projectMemories ?? context.memory ?? context.memories ?? [];
  const importantMemoriesRaw = context.importantMemories ?? [];
  const recentSessionsRaw = context.recentSessions ?? context.sessions ?? [];

  return {
    project: normalizeProject(context.project),
    projectMemories: Array.isArray(projectMemoriesRaw) ? projectMemoriesRaw.map(normalizeMemoryItem).filter(Boolean) as ImportantMemory[] : [],
    importantMemories: Array.isArray(importantMemoriesRaw) ? importantMemoriesRaw.map(normalizeMemoryItem).filter(Boolean) as ImportantMemory[] : [],
    relevantMemories: Array.isArray(context.relevantMemories) ? context.relevantMemories.map(normalizeMemoryItem).filter(Boolean) as ImportantMemory[] : [],
    recentSessions: Array.isArray(recentSessionsRaw) ? recentSessionsRaw.map(normalizeSession) : []
  };
}

function rankRelevant(context: MemoryContext, query?: string | null): MemoryContext {
  const terms = tokenizeQuery(query);
  const combined = [...context.projectMemories, ...context.importantMemories];
  const seen = new Set<string>();

  const scored = combined
    .filter((memory) => {
      if (seen.has(memory.id)) return false;
      seen.add(memory.id);
      return true;
    })
    .map((memory) => ({ memory, score: scoreMemory(memory, terms) }));

  const relevantMemories = (terms.length ? scored.filter((item) => item.score > 0) : scored)
    .sort((a, b) => b.score - a.score || (b.memory.salience ?? 0) - (a.memory.salience ?? 0))
    .slice(0, 8)
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

  // A partir do PATCH 044, o contexto padrao passa a ser o projeto ativo/default.
  // Se projectId vier nulo, a RPC seleciona o projeto ativo mais recente do usuario.
  const projectResult = await supabase.rpc('get_project_memory_context', {
    p_user_id: userId,
    p_project_id: projectId ?? null,
    p_limit: limit
  } as any);

  if (!projectResult.error) {
    return { context: rankRelevant(normalizeContext(projectResult.data), query), error: null };
  }

  // Fallback para memoria global, caso a instalacao ainda nao tenha Project Memory completo.
  const globalResult = await supabase.rpc('get_memory_context', { p_user_id: userId, p_limit: limit } as any);
  if (globalResult.error) {
    return { context: DEFAULT_CONTEXT, error: `${projectResult.error.message} | ${globalResult.error.message}` };
  }

  return { context: rankRelevant(normalizeContext(globalResult.data), query), error: null };
}

function hasQuestionAboutMemory(message: string) {
  const lower = stripAccents(message);
  return /\b(qual|onde|em que|o que|quais)\b/.test(lower)
    && /\b(proxima etapa|proximo passo|decisao|decisao|pendencia|onde paramos|etapa|marco|status)\b/.test(lower);
}

export function buildMemoryPrompt(context: MemoryContext, userMessage?: string | null) {
  const projectHeader = context.project
    ? `Projeto ativo: ${context.project.name}${context.project.description ? ` — ${context.project.description}` : ''}`
    : '';

  const relevant = context.relevantMemories
    .slice(0, 8)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const projectMemories = context.projectMemories
    .filter((item) => !context.relevantMemories.some((relevantItem) => relevantItem.id === item.id))
    .slice(0, 10)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const memories = context.importantMemories
    .filter((item) => !context.relevantMemories.some((relevantItem) => relevantItem.id === item.id))
    .slice(0, 6)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const sessions = context.recentSessions
    .slice(0, 6)
    .filter((session) => session.summary || session.title)
    .map((session, index) => `${index + 1}. ${session.title}${session.summary ? ` — ${session.summary}` : ''}`)
    .join('\n');

  const mustUseMemory = hasQuestionAboutMemory(userMessage ?? '')
    ? 'A pergunta do usuário pede recuperação de memória do projeto. Se houver memórias relevantes acima, responda diretamente com elas. Não diga que não possui registros quando houver memórias listadas.'
    : '';

  if (!projectHeader && !relevant && !projectMemories && !memories && !sessions) {
    return 'Memória permanente: ainda sem registros relevantes além do perfil inteligente.';
  }

  return [
    'Memória permanente, memória de projeto e histórico recuperado:',
    projectHeader,
    mustUseMemory,
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

function extractAfterPattern(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return compactText(match[1].trim().replace(/[.;]+$/, ''), 260);
  }
  return null;
}

function extractMemoryCandidate(userMessage: string, _assistantMessage: string, projectId?: string | null): MemoryCandidate | null {
  const text = userMessage.trim();
  const lower = stripAccents(text);
  if (text.length < 8) return null;

  const nextStep = extractAfterPattern(text, [
    /(?:pr[oó]xima etapa|pr[oó]ximo passo|pr[oó]xima fase)\s+(?:é|eh|sera|será|:)?\s*(.+)$/i,
    /(?:a etapa agora|o passo agora)\s+(?:é|eh|sera|será|:)?\s*(.+)$/i
  ]);
  if (nextStep) {
    return {
      kind: 'task',
      scope: projectId ? 'project' : 'user',
      title: 'Próxima etapa do projeto',
      content: `A próxima etapa deste projeto é ${nextStep}.`,
      salience: 5,
      tags: projectId ? ['chat', 'auto', 'project', 'next-step'] : ['chat', 'auto', 'next-step']
    };
  }

  const decision = extractAfterPattern(text, [
    /(?:decis[aã]o|definimos|ficou definido|foi definido|aprovamos|foi aprovado)\s*(?:foi|é|eh|:)?\s*(.+)$/i,
    /(?:neste projeto|nesse projeto).*?(?:decidimos|definimos)\s*(?:que)?\s*(.+)$/i
  ]);
  if (decision) {
    return {
      kind: 'decision',
      scope: projectId ? 'project' : 'user',
      title: 'Decisão registrada',
      content: `Decisão registrada: ${decision}.`,
      salience: 5,
      tags: projectId ? ['chat', 'auto', 'project', 'decision'] : ['chat', 'auto', 'decision']
    };
  }

  const preference = extractAfterPattern(text, [
    /(?:prefiro|gosto que|quero que voce|quero que você|a partir de agora)\s+(.+)$/i
  ]);
  if (preference) {
    return {
      kind: 'preference',
      scope: 'user',
      title: 'Preferência do usuário',
      content: `Preferência registrada: ${preference}.`,
      salience: 4,
      tags: ['chat', 'auto', 'preference']
    };
  }

  const looksPersistent = /\b(lembre|memorize|guarde|salve|sou |meu |minha |cliente|empresa|curso|livro|senai|prazo|objetivo|pend[eê]ncia|patch|document engine|action engine|voice engine|memory engine)\b/i.test(text);
  if (!looksPersistent || text.length < 12) return null;

  let kind: ImportantMemory['kind'] = 'fact';
  if (lower.includes('pendencia') || lower.includes('pendência')) kind = 'task';
  else if (lower.includes('prefiro')) kind = 'preference';
  else if (lower.includes('projeto')) kind = 'project';
  else if (lower.includes('decisao') || lower.includes('definimos') || lower.includes('aprovado')) kind = 'decision';

  return {
    kind,
    scope: projectId ? 'project' : 'user',
    title: kind === 'project' ? 'Informação do projeto' : compactText(text, 64),
    content: compactText(`Usuário informou: ${text}`, 500),
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
      event_type: candidate?.kind === 'decision' ? 'decision' : candidate?.kind === 'task' ? 'next_step' : 'chat_turn',
      title: candidate?.title ?? compactText(input.userMessage, 96),
      description: candidate?.content ?? summary,
      metadata: { persona: input.persona, sessionId, memoryRecorded: Boolean(candidate) }
    });
  }

  return { sessionId, memoryRecorded: Boolean(candidate), memoryTitle: candidate?.title ?? null };
}
