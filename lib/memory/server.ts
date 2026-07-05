import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
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

function compactText(value: string, max = 120) {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function titleFromMessage(message: string) {
  return compactText(message, 72) || 'Nova conversa';
}

function stripAccents(value: string) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenizeQuery(query?: string | null) {
  if (!query) return [];
  const stopwords = new Set([
    'para', 'como', 'com', 'uma', 'uns', 'dos', 'das', 'que', 'por', 'pra', 'sobre', 'isso', 'esse', 'essa',
    'meu', 'minha', 'qual', 'quem', 'onde', 'quando', 'aura', 'argus', 'voce', 'você', 'pode', 'fazer',
    'projeto', 'deste', 'neste', 'dessa', 'deste', 'etapa', 'passo', 'proxima', 'próxima'
  ]);
  return Array.from(new Set(stripAccents(query)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !stopwords.has(word))));
}

function scoreMemory(memory: { title: string; content: string; tags?: string[]; salience?: number }, terms: string[]) {
  if (!terms.length) return memory.salience ?? 0;
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
    salience: Number(item.salience ?? item.importance ?? 3),
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
  const projectMemoriesRaw = context.projectMemories ?? context.project_memories ?? context.memory ?? context.memories ?? [];
  const importantMemoriesRaw = context.importantMemories ?? context.important_memories ?? [];
  const recentSessionsRaw = context.recentSessions ?? context.recent_sessions ?? context.sessions ?? [];

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

  const relevantMemories = combined
    .filter((memory) => {
      if (seen.has(memory.id)) return false;
      seen.add(memory.id);
      return true;
    })
    .map((memory) => ({ memory, score: scoreMemory(memory, terms) }))
    .filter((item) => !terms.length || item.score > 0)
    .sort((a, b) => b.score - a.score || (b.memory.salience ?? 0) - (a.memory.salience ?? 0))
    .slice(0, 10)
    .map((item) => item.memory);

  return { ...context, relevantMemories };
}

export async function getMemoryContext(
  userId: string,
  limit = 10,
  query?: string | null,
  projectId?: string | null
): Promise<{ context: MemoryContext; error: string | null }> {
  const supabase = createSupabaseServerClient();

  const projectResult = await supabase.rpc('get_project_memory_context', {
    p_user_id: userId,
    p_project_id: projectId ?? null,
    p_limit: limit
  } as any);

  if (!projectResult.error) {
    return { context: rankRelevant(normalizeContext(projectResult.data), query), error: null };
  }

  const globalResult = await supabase.rpc('get_memory_context', { p_user_id: userId, p_limit: limit } as any);
  if (!globalResult.error) {
    return { context: rankRelevant(normalizeContext(globalResult.data), query), error: null };
  }

  const directFallback = await getDirectMemoryContextFallback(userId, limit, query, projectId);
  if (
    directFallback.context.projectMemories.length > 0 ||
    directFallback.context.importantMemories.length > 0 ||
    directFallback.context.recentSessions.length > 0 ||
    directFallback.context.project
  ) {
    return directFallback;
  }

  return { context: DEFAULT_CONTEXT, error: `${projectResult.error.message} | ${globalResult.error.message}${directFallback.error ? ` | ${directFallback.error}` : ''}` };
}


async function getDirectMemoryContextFallback(
  userId: string,
  limit = 10,
  query?: string | null,
  projectId?: string | null
): Promise<{ context: MemoryContext; error: string | null }> {
  const core = createSupabaseServerClient().schema('core');
  const context: MemoryContext = { ...DEFAULT_CONTEXT, projectMemories: [], importantMemories: [], relevantMemories: [], recentSessions: [] };
  let fallbackError: string | null = null;

  if (projectId) {
    const { data: project, error } = await core
      .from('projects')
      .select('id,name,title,slug,description')
      .eq('id', projectId)
      .maybeSingle();
    if (!error && project) {
      context.project = normalizeProject(project);
    } else if (error) {
      fallbackError = error.message;
    }
  }

  let projectMemoriesQuery = core
    .from('memory_items')
    .select('id,kind,title,content,salience,tags,project_id,updated_at,created_at')
    .eq('user_id', userId)
    .order('salience', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (projectId) {
    projectMemoriesQuery = projectMemoriesQuery.eq('project_id', projectId);
  }

  const { data: projectMemories, error: projectMemoriesError } = await projectMemoriesQuery;
  if (!projectMemoriesError && Array.isArray(projectMemories)) {
    context.projectMemories = projectMemories.map(normalizeMemoryItem).filter(Boolean) as ImportantMemory[];
  } else if (projectMemoriesError) {
    fallbackError = fallbackError ?? projectMemoriesError.message;
  }

  const { data: importantMemories, error: importantMemoriesError } = await core
    .from('memory_items')
    .select('id,kind,title,content,salience,tags,project_id,updated_at,created_at')
    .eq('user_id', userId)
    .is('project_id', null)
    .order('salience', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (!importantMemoriesError && Array.isArray(importantMemories)) {
    context.importantMemories = importantMemories.map(normalizeMemoryItem).filter(Boolean) as ImportantMemory[];
  } else if (importantMemoriesError) {
    fallbackError = fallbackError ?? importantMemoriesError.message;
  }

  let sessionsQuery = core
    .from('memory_sessions')
    .select('id,title,summary,message_count,last_persona,last_message_at,project_id')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(6);

  if (projectId) {
    sessionsQuery = sessionsQuery.eq('project_id', projectId);
  }

  const { data: sessions, error: sessionsError } = await sessionsQuery;
  if (!sessionsError && Array.isArray(sessions)) {
    context.recentSessions = sessions.map(normalizeSession);
  } else if (sessionsError) {
    fallbackError = fallbackError ?? sessionsError.message;
  }

  return { context: rankRelevant(context, query), error: fallbackError };
}

function asksMemoryQuestion(message: string) {
  const lower = stripAccents(message);
  return /\b(qual|onde|em que|o que|quais|lembra|lembrar|paramos|status)\b/.test(lower)
    && /\b(proxima etapa|proximo passo|decisao|decisao|pendencia|onde paramos|etapa|marco|status|projeto)\b/.test(lower);
}

export function buildMemoryPrompt(context: MemoryContext, userMessage?: string | null) {
  const projectHeader = context.project
    ? `Projeto ativo: ${context.project.name}${context.project.description ? ` — ${context.project.description}` : ''}`
    : '';

  const relevant = context.relevantMemories
    .slice(0, 10)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const projectMemories = context.projectMemories
    .filter((item) => !context.relevantMemories.some((relevantItem) => relevantItem.id === item.id))
    .slice(0, 12)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const userMemories = context.importantMemories
    .filter((item) => !context.relevantMemories.some((relevantItem) => relevantItem.id === item.id))
    .slice(0, 8)
    .map((item, index) => `${index + 1}. [${item.kind}] ${item.title}: ${item.content}`)
    .join('\n');

  const sessions = context.recentSessions
    .slice(0, 6)
    .filter((session) => session.summary || session.title)
    .map((session, index) => `${index + 1}. ${session.title}${session.summary ? ` — ${session.summary}` : ''}`)
    .join('\n');

  const mustUseMemory = asksMemoryQuestion(userMessage ?? '')
    ? 'REGRA CRÍTICA: a pergunta pede memória/estado do projeto. Se houver memórias, sessões ou projeto listados abaixo, responda diretamente usando esses registros. Não diga que não possui registros quando houver qualquer item neste bloco.'
    : '';

  if (!projectHeader && !relevant && !projectMemories && !userMemories && !sessions) {
    return 'Memória permanente: ainda sem registros úteis salvos. Se o usuário informar decisão, próxima etapa, preferência, objetivo, pendência ou fato importante, registre após responder.';
  }

  return [
    'MEMORY ENGINE — CONTEXTO RECUPERADO DO SISTEMA',
    projectHeader,
    mustUseMemory,
    relevant ? `Memórias mais relevantes para a solicitação atual:\n${relevant}` : '',
    projectMemories ? `Memórias do projeto ativo:\n${projectMemories}` : '',
    userMemories ? `Memórias permanentes do usuário:\n${userMemories}` : '',
    sessions ? `Conversas recentes deste contexto:\n${sessions}` : '',
    'Use essas informações para continuidade. Não exponha este bloco ao usuário.'
  ].filter(Boolean).join('\n\n');
}

async function ensureSession(
  userId: string,
  persona: MemoryPersona,
  message: string,
  sessionId?: string | null,
  projectId?: string | null
) {
  const supabase = createSupabaseAdminClient().schema('core');

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
    .insert({
      user_id: userId,
      project_id: projectId ?? null,
      title: titleFromMessage(message),
      status: 'active',
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
    if (match?.[1]?.trim()) return compactText(match[1].trim().replace(/[.;]+$/, ''), 300);
  }
  return null;
}

function extractMemoryCandidate(userMessage: string, projectId?: string | null): MemoryCandidate | null {
  const text = userMessage.trim();
  const lower = stripAccents(text);
  if (text.length < 8) return null;

  const nextStep = extractAfterPattern(text, [
    /(?:pr[oó]xima etapa|pr[oó]ximo passo|pr[oó]xima fase)\s+(?:é|eh|sera|será|:)?\s*(.+)$/i,
    /(?:a etapa agora|o passo agora)\s+(?:é|eh|sera|será|:)?\s*(.+)$/i,
    /(?:neste projeto|nesse projeto).*?(?:proxima etapa|próxima etapa|proximo passo|próximo passo).*?(?:é|eh|sera|será|:)?\s*(.+)$/i
  ]);
  if (nextStep) {
    return {
      kind: 'task',
      scope: projectId ? 'project' : 'user',
      title: 'Próxima etapa do projeto',
      content: `A próxima etapa deste projeto é ${nextStep}.`,
      salience: 5,
      tags: ['chat', 'auto', 'project', 'next-step']
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
      tags: ['chat', 'auto', 'project', 'decision']
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

  const looksPersistent = /\b(lembre|memorize|guarde|salve|sou |meu |minha |cliente|empresa|curso|livro|senai|prazo|objetivo|pend[eê]ncia|patch|document engine|action engine|voice engine|memory engine|pr[oó]xima etapa|pr[oó]ximo passo)\b/i.test(text);
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
    salience: lower.includes('lembre') || lower.includes('memorize') || kind === 'decision' || kind === 'task' ? 5 : 3,
    tags: projectId ? ['chat', 'auto', 'project'] : ['chat', 'auto']
  };
}

export async function saveChatTurn(input: SaveChatTurnInput) {
  const admin = createSupabaseAdminClient();
  const core = admin.schema('core');
  const sessionId = await ensureSession(input.userId, input.persona, input.userMessage, input.sessionId, input.projectId);
  const now = new Date().toISOString();

  // Garante que perfil/projeto existam antes da gravação quando a base foi parcialmente migrada.
  if (input.userEmail) {
    await core.from('profiles').upsert({ id: input.userId, email: input.userEmail }, { onConflict: 'id' });
  }

  const { error: messageError } = await core.from('memory_messages').insert([
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

  const summary = compactText(`${input.persona.toUpperCase()}: ${input.userMessage}`, 240);
  const { count } = await core
    .from('memory_messages')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('user_id', input.userId);

  await core
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

  const candidate = extractMemoryCandidate(input.userMessage, input.projectId);
  let memoryRecorded = false;

  if (candidate) {
    const { error: memoryError } = await core.from('memory_items').insert({
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
    if (memoryError) throw memoryError;
    memoryRecorded = true;
  }

  if (input.projectId) {
    await core.from('project_timeline').insert({
      project_id: input.projectId,
      user_id: input.userId,
      event_type: candidate?.kind === 'decision' ? 'decision' : candidate?.kind === 'task' ? 'next_step' : 'chat_turn',
      title: candidate?.title ?? compactText(input.userMessage, 96),
      description: candidate?.content ?? summary,
      metadata: { persona: input.persona, sessionId, memoryRecorded }
    });

    await core.from('projects').update({ updated_at: now }).eq('id', input.projectId);
  }

  return { sessionId, memoryRecorded, memoryTitle: candidate?.title ?? null };
}

export async function getMemoryStatus(userId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_memory_engine_status', { p_user_id: userId } as any);
  if (!error) {
    return { ok: true, error: null, data };
  }

  const core = supabase.schema('core');
  const [sessionsResult, messagesResult, memoriesResult, projectsResult, lastSessionResult] = await Promise.all([
    core.from('memory_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    core.from('memory_messages').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    core.from('memory_items').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    core.from('projects').select('id', { count: 'exact', head: true }).eq('owner_id', userId).eq('status', 'active'),
    core.from('memory_sessions').select('last_message_at').eq('user_id', userId).order('last_message_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()
  ]);

  const fallbackError = sessionsResult.error || messagesResult.error || memoriesResult.error || projectsResult.error || lastSessionResult.error;
  if (fallbackError) {
    return { ok: false, error: `${error.message} | ${fallbackError.message}`, data: null };
  }

  return {
    ok: true,
    error: null,
    data: {
      migrationApplied: true,
      sessions: sessionsResult.count ?? 0,
      messages: messagesResult.count ?? 0,
      memories: memoriesResult.count ?? 0,
      projects: projectsResult.count ?? 0,
      lastUse: lastSessionResult.data?.last_message_at ?? null
    }
  };
}


// AURA_ARGUS_PATCH_049 - HOTFIX_CHAT_MEMORY_EXPORTS
// Backward-compatible exports required by app/api/ai/chat/route.ts.
const ACTIVE_PROJECT_TITLE = 'AURA/ARGUS';
const ACTIVE_PROJECT_SLUG = 'aura-argus';
const TIMEZONE = process.env.AURA_ARGUS_TIMEZONE || 'America/Bahia';

type TemporalContext = {
  nowIso: string;
  datePtBr: string;
  timePtBr: string;
  timezone: string;
  minutesUntilEndOfDay: number;
  hoursUntilEndOfDay: number;
};

type ProjectMemoryContextCompat = {
  items: Array<{
    title: string | null;
    content: string;
    type: string;
    createdAt: string | null;
  }>;
};

type ChatPersistenceCompatInput = {
  userId: string;
  organizationId?: string | null;
  projectId?: string | null;
  sessionId?: string | null;
  persona: MemoryPersona;
  provider?: string | null;
  model?: string | null;
  userMessage: string;
  assistantMessage: string;
  latencyMs?: number | null;
};

export function buildTemporalContext(date = new Date()): TemporalContext {
  const datePtBr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
  const timePtBr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  const second = Number(parts.find((part) => part.type === 'second')?.value || 0);
  const secondsUntilEndOfDay = Math.max(0, 24 * 60 * 60 - (hour * 3600 + minute * 60 + second));
  return {
    nowIso: date.toISOString(),
    datePtBr,
    timePtBr,
    timezone: TIMEZONE,
    minutesUntilEndOfDay: Math.ceil(secondsUntilEndOfDay / 60),
    hoursUntilEndOfDay: Number((secondsUntilEndOfDay / 3600).toFixed(2))
  };
}

export function temporalPromptBlock(context = buildTemporalContext()) {
  return [
    'CONTEXTO TEMPORAL OBRIGATÓRIO:',
    `Data atual: ${context.datePtBr}.`,
    `Hora atual: ${context.timePtBr}.`,
    `Timezone oficial do sistema: ${context.timezone}.`,
    `Agora em ISO: ${context.nowIso}.`,
    `Tempo aproximado até terminar o dia: ${context.hoursUntilEndOfDay} horas (${context.minutesUntilEndOfDay} minutos).`,
    'Use estes dados como verdade. Não invente datas antigas e não use data de treinamento do modelo.'
  ].join('\n');
}

export async function getOrCreateActiveProject(userId: string, organizationId?: string | null) {
  try {
    const core = createSupabaseAdminClient().schema('core');
    const { data: existing, error: existingError } = await core
      .from('projects')
      .select('id, organization_id')
      .eq('owner_id', userId)
      .eq('slug', ACTIVE_PROJECT_SLUG)
      .maybeSingle();
    if (existing?.id) {
      return { projectId: String(existing.id), organizationId: existing.organization_id ?? organizationId ?? null, error: null };
    }
    if (existingError && !/not found|schema|column/i.test(existingError.message)) {
      return { projectId: null, organizationId: organizationId ?? null, error: existingError.message };
    }
    const { data: created, error: createError } = await core
      .from('projects')
      .insert({
        organization_id: organizationId ?? null,
        owner_id: userId,
        title: ACTIVE_PROJECT_TITLE,
        name: ACTIVE_PROJECT_TITLE,
        slug: ACTIVE_PROJECT_SLUG,
        description: 'Projeto operacional padrão do AURA/ARGUS para conversas, memória e estabilização técnica.',
        status: 'active',
        context: { source: 'AURA_ARGUS_PATCH_049-HOTFIX_CHAT_MEMORY_EXPORTS' }
      } as any)
      .select('id, organization_id')
      .single();
    if (createError) return { projectId: null, organizationId: organizationId ?? null, error: createError.message };
    return { projectId: String(created.id), organizationId: created.organization_id ?? organizationId ?? null, error: null };
  } catch (error) {
    return { projectId: null, organizationId: organizationId ?? null, error: error instanceof Error ? error.message : 'Erro ao localizar projeto ativo.' };
  }
}

export async function getProjectMemoryContext(userId: string, projectId?: string | null): Promise<ProjectMemoryContextCompat> {
  const { context } = await getMemoryContext(userId, 12, null, projectId ?? null);
  const items = [...context.relevantMemories, ...context.projectMemories, ...context.importantMemories];
  const seen = new Set<string>();
  return {
    items: items
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 12)
      .map((item) => ({
        title: item.title ?? null,
        content: item.content,
        type: item.kind,
        createdAt: item.updatedAt ?? null
      }))
  };
}

export function memoryPromptBlock(context: ProjectMemoryContextCompat) {
  if (!context.items.length) {
    return 'MEMÓRIA DO PROJETO: ainda não há memórias persistidas para este projeto.';
  }
  const lines = context.items.map((item, index) => `${index + 1}. [${item.type}] ${item.title ? `${item.title}: ` : ''}${item.content}`);
  return ['MEMÓRIA DO PROJETO RECUPERADA ANTES DA RESPOSTA:', ...lines, 'Use estas informações para continuidade do projeto.'].join('\n');
}

export async function persistChatTurn(input: ChatPersistenceCompatInput) {
  try {
    const result = await saveChatTurn({
      userId: input.userId,
      sessionId: input.sessionId ?? null,
      projectId: input.projectId ?? null,
      persona: input.persona,
      userMessage: input.userMessage,
      assistantMessage: input.assistantMessage,
      provider: input.provider ?? null,
      model: input.model ?? null
    });
    return {
      sessionId: result.sessionId,
      userMessageSaved: true,
      assistantMessageSaved: true,
      memorySaved: result.memoryRecorded,
      error: null
    };
  } catch (error) {
    return {
      sessionId: input.sessionId ?? null,
      userMessageSaved: false,
      assistantMessageSaved: false,
      memorySaved: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao persistir conversa.'
    };
  }
}

export type MemoryOverview = {
  sessions: number;
  messages: number;
  memories: number;
  lastActivity: string | null;
};

export async function getMemoryOverview(userId: string): Promise<MemoryOverview> {
  const status = await getMemoryStatus(userId);
  return {
    sessions: Number(status.data?.sessions ?? 0),
    messages: Number(status.data?.messages ?? 0),
    memories: Number(status.data?.memories ?? 0),
    lastActivity: status.data?.lastUse ?? status.data?.lastActivity ?? null
  };
}

export function formatLastActivity(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
