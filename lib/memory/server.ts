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

const ACTIVE_PROJECT_TITLE = 'AURA/ARGUS AI Operating System';
const ACTIVE_PROJECT_SLUG = 'aura-argus';
const TIMEZONE = process.env.AURA_ARGUS_TIMEZONE || 'America/Bahia';

type MemoryCandidate = {
  kind: ImportantMemory['kind'];
  scope: 'user' | 'project' | 'session' | 'organization';
  title: string;
  content: string;
  salience: number;
  tags: string[];
};

type SupabaseLike = any;

function coreReader(): SupabaseLike {
  return createSupabaseServerClient().schema('core');
}

function coreWriter(): SupabaseLike {
  try {
    return createSupabaseAdminClient().schema('core');
  } catch {
    return createSupabaseServerClient().schema('core');
  }
}

function compactText(value: string, max = 120) {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function stripAccents(value: string) {
  return (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function titleFromMessage(message: string) {
  return compactText(message, 72) || 'Nova conversa';
}

function isQuestionLike(text: string) {
  const value = stripAccents((text || '').trim());
  if (!value) return false;
  if (/[?？]$/.test(value)) return true;
  return /^(qual|quais|o que|quem|onde|quando|como|por que|porque|resuma|resumo|liste|me diga|voce sabe|você sabe|quanto|quantas|quantos)\b/.test(value);
}

function isCorruptedMemoryText(text: string) {
  const value = stripAccents((text || '').replace(/\s+/g, ' ').trim());
  if (!value) return true;
  if (isQuestionLike(value)) return true;
  return [
    /proxima etapa deste projeto e deste projeto/,
    /proxima etapa deste projeto e qual/,
    /proxima etapa deste projeto e resuma/,
    /proxima etapa deste projeto e o que/,
    /proxima etapa deste projeto e banco/,
    /banco principal.*qual banco/,
    /framework.*qual framework/,
    /deploy.*qual deploy/,
    /usuario informou:\s*qual/,
    /usuario informou:\s*resuma/,
    /usuario informou:\s*o que/,
  ].some((pattern) => pattern.test(value));
}

function cleanExtractedFact(value: string | null) {
  if (!value) return null;
  const cleaned = compactText(value.replace(/[.;]+$/, '').trim(), 300);
  if (!cleaned || isCorruptedMemoryText(cleaned)) return null;
  return cleaned;
}

function tokenizeQuery(query?: string | null) {
  if (!query) return [];
  const stopwords = new Set(['para', 'como', 'com', 'uma', 'uns', 'dos', 'das', 'que', 'por', 'pra', 'sobre', 'isso', 'esse', 'essa', 'meu', 'minha', 'qual', 'quais', 'quem', 'onde', 'quando', 'aura', 'argus', 'voce', 'você', 'pode', 'fazer', 'projeto', 'deste', 'neste', 'dessa', 'etapa', 'passo', 'proxima', 'próxima', 'utilizando', 'estou']);
  return Array.from(new Set(stripAccents(query).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length >= 3 && !stopwords.has(word))));
}

function scoreMemory(memory: { title: string; content: string; tags?: string[]; salience?: number }, terms: string[]) {
  if (!terms.length) return memory.salience ?? 0;
  const haystack = stripAccents(`${memory.title} ${memory.content} ${(memory.tags ?? []).join(' ')}`);
  const matches = terms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
  return matches * 10 + (memory.salience ?? 0);
}

function normalizeMemoryItem(item: any): ImportantMemory | null {
  if (!item) return null;
  const title = String(item.title ?? item.kind ?? item.type ?? 'Memória');
  const content = String(item.content ?? item.description ?? '');
  if (!content.trim() && !title.trim()) return null;
  if (isCorruptedMemoryText(title) || isCorruptedMemoryText(content)) return null;
  return {
    id: String(item.id ?? `${title}-${content}`),
    kind: String(item.kind ?? item.type ?? 'note'),
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
    lastMessageAt: item.lastMessageAt ?? item.last_message_at ?? item.updated_at ?? null,
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


function memoryPriorityScore(memory: { title: string; content: string; tags?: string[]; salience?: number; kind?: string; updatedAt?: string | null }) {
  const haystack = stripAccents(`${memory.title} ${memory.content} ${(memory.tags ?? []).join(' ')} ${memory.kind ?? ''}`);
  let score = Number(memory.salience ?? 3) * 10;

  if (/proxima etapa|proximo passo|next-step|pendencia|task|marco/.test(haystack)) score += 80;
  if (/banco principal|database|supabase|framework|next\.?js|nextjs|deploy|vercel|ia estrategica|ia operacional|claude|gemini/.test(haystack)) score += 70;
  if (/objetivo principal|nome do projeto|aura\/argus|aura argus|ai operating system/.test(haystack)) score += 60;
  if (/decisao|decision|definimos|aprovado/.test(haystack)) score += 55;
  if (/confirmed|confirmado|project|projeto/.test(haystack)) score += 40;
  if (/editor|vs code|windows|linux|ambiente de desenvolvimento/.test(haystack)) score += 20;
  if (/cor favorita|preferencia pessoal/.test(haystack)) score -= 15;
  if (isCorruptedMemoryText(memory.title) || isCorruptedMemoryText(memory.content)) score -= 500;

  const updatedAt = memory.updatedAt ? Date.parse(memory.updatedAt) : 0;
  if (updatedAt > 0) {
    const ageHours = Math.max(0, (Date.now() - updatedAt) / 36e5);
    score += Math.max(0, 24 - Math.min(24, ageHours));
  }

  return score;
}

function sortByMemoryPriority<T extends { title: string; content: string; tags?: string[]; salience?: number; kind?: string; updatedAt?: string | null }>(items: T[]) {
  return [...items]
    .filter((item) => !isCorruptedMemoryText(item.title) && !isCorruptedMemoryText(item.content))
    .sort((a, b) => memoryPriorityScore(b) - memoryPriorityScore(a));
}

function rankRelevant(context: MemoryContext, query?: string | null): MemoryContext {
  const terms = tokenizeQuery(query);
  const combined = sortByMemoryPriority([...context.projectMemories, ...context.importantMemories]);
  const seen = new Set<string>();
  const relevantMemories = combined
    .filter((memory) => {
      if (seen.has(memory.id)) return false;
      seen.add(memory.id);
      return true;
    })
    .map((memory) => ({ memory, score: scoreMemory(memory, terms) }))
    .filter((item) => !terms.length || item.score > 0)
    .sort((a, b) => b.score - a.score || memoryPriorityScore(b.memory) - memoryPriorityScore(a.memory))
    .slice(0, 12)
    .map((item) => item.memory);

  const fallbackRelevant = relevantMemories.length ? relevantMemories : combined.slice(0, 8);
  return { ...context, relevantMemories: fallbackRelevant };
}

async function safeSelectMemories(userId: string, limit: number, projectId?: string | null) {
  const core = coreReader();
  const selectFull = 'id,kind,title,content,salience,tags,project_id,updated_at,created_at';
  const selectCompat = 'id,kind,title,content,salience,tags,updated_at,created_at';

  let query = core.from('memory_items').select(selectFull).eq('user_id', userId).order('salience', { ascending: false }).order('updated_at', { ascending: false }).limit(limit);
  if (projectId) query = query.eq('project_id', projectId);
  let result = await query;

  if (result.error) {
    result = await core.from('memory_items').select(selectCompat).eq('user_id', userId).order('salience', { ascending: false }).order('updated_at', { ascending: false }).limit(limit);
  }

  return { data: Array.isArray(result.data) ? result.data : [], error: result.error?.message ?? null };
}

async function safeSelectSessions(userId: string, limit: number, projectId?: string | null) {
  const core = coreReader();
  const selectFull = 'id,title,summary,message_count,last_persona,last_message_at,project_id,updated_at';
  const selectCompat = 'id,title,summary,message_count,last_persona,last_message_at,updated_at';

  let query = core.from('memory_sessions').select(selectFull).eq('user_id', userId).neq('status', 'deleted').order('last_message_at', { ascending: false, nullsFirst: false }).limit(limit);
  if (projectId) query = query.eq('project_id', projectId);
  let result = await query;

  if (result.error) {
    result = await core.from('memory_sessions').select(selectCompat).eq('user_id', userId).neq('status', 'deleted').order('last_message_at', { ascending: false, nullsFirst: false }).limit(limit);
  }

  return { data: Array.isArray(result.data) ? result.data : [], error: result.error?.message ?? null };
}

export async function getMemoryContext(userId: string, limit = 10, query?: string | null, projectId?: string | null): Promise<{ context: MemoryContext; error: string | null }> {
  const context: MemoryContext = { ...DEFAULT_CONTEXT, projectMemories: [], importantMemories: [], relevantMemories: [], recentSessions: [] };
  let fallbackError: string | null = null;

  try {
    if (projectId) {
      const { data: project } = await coreReader().from('projects').select('id,name,title,slug,description').eq('id', projectId).maybeSingle();
      context.project = normalizeProject(project);
    }
  } catch (error) {
    fallbackError = error instanceof Error ? error.message : null;
  }

  const memories = await safeSelectMemories(userId, Math.max(limit, 16), projectId);
  if (memories.error) fallbackError = fallbackError ?? memories.error;
  context.projectMemories = memories.data.map(normalizeMemoryItem).filter(Boolean) as ImportantMemory[];

  if (projectId) {
    const globalMemories = await safeSelectMemories(userId, 8, null);
    context.importantMemories = globalMemories.data
      .map(normalizeMemoryItem)
      .filter(Boolean)
      .filter((item: any) => !item.projectId) as ImportantMemory[];
  } else {
    context.importantMemories = [];
  }

  const sessions = await safeSelectSessions(userId, 8, projectId);
  if (sessions.error) fallbackError = fallbackError ?? sessions.error;
  context.recentSessions = sessions.data.map(normalizeSession);

  return { context: rankRelevant(context, query), error: fallbackError };
}

function asksMemoryQuestion(message: string) {
  const lower = stripAccents(message);
  return /\b(qual|quais|onde|em que|o que|lembra|lembrar|paramos|status|resuma|resumo)\b/.test(lower)
    && /\b(proxima etapa|proximo passo|banco|framework|deploy|arquitetura|decisao|pendencia|onde paramos|etapa|marco|status|projeto)\b/.test(lower);
}

export function buildMemoryPrompt(context: MemoryContext, userMessage?: string | null) {
  const projectHeader = context.project ? `Projeto ativo: ${context.project.name}${context.project.description ? ` — ${context.project.description}` : ''}` : '';
  const relevantOrdered = sortByMemoryPriority(context.relevantMemories).slice(0, 12);
  const relevantIds = new Set(relevantOrdered.map((item) => item.id));
  const projectOrdered = sortByMemoryPriority(context.projectMemories.filter((item) => !relevantIds.has(item.id))).slice(0, 12);
  const userOrdered = sortByMemoryPriority(context.importantMemories.filter((item) => !relevantIds.has(item.id))).slice(0, 8);
  const relevant = relevantOrdered.map((item, index) => `${index + 1}. [P${Math.round(memoryPriorityScore(item))} · ${item.kind}] ${item.title}: ${item.content}`).join('\n');
  const projectMemories = projectOrdered.map((item, index) => `${index + 1}. [P${Math.round(memoryPriorityScore(item))} · ${item.kind}] ${item.title}: ${item.content}`).join('\n');
  const userMemories = userOrdered.map((item, index) => `${index + 1}. [P${Math.round(memoryPriorityScore(item))} · ${item.kind}] ${item.title}: ${item.content}`).join('\n');
  const sessions = context.recentSessions.slice(0, 6).filter((session) => session.summary || session.title).map((session, index) => `${index + 1}. ${session.title}${session.summary ? ` — ${session.summary}` : ''}`).join('\n');
  const mustUseMemory = asksMemoryQuestion(userMessage ?? '') ? 'REGRA CRÍTICA: a pergunta pede memória/estado do projeto. Se houver memórias, sessões ou projeto listados abaixo, responda diretamente usando esses registros. Não diga que não possui registros quando houver qualquer item neste bloco.' : '';
  const priorityRule = 'ORDEM DE PRIORIDADE DA MEMÓRIA: 1) próxima etapa, decisões, banco, framework, deploy, IA estratégica/operacional e objetivo do projeto; 2) fatos técnicos do ambiente; 3) preferências de trabalho; 4) preferências pessoais. Não deixe preferências pessoais sobrepor decisões do projeto.';

  if (!projectHeader && !relevant && !projectMemories && !userMemories && !sessions) {
    return 'Memória permanente: ainda sem registros úteis salvos. Se o usuário informar decisão, próxima etapa, preferência, objetivo, pendência ou fato importante, registre após responder.';
  }

  return ['MEMORY ENGINE — CONTEXTO RECUPERADO DO SISTEMA', projectHeader, priorityRule, mustUseMemory, relevant ? `Memórias prioritárias para a solicitação atual:
${relevant}` : '', projectMemories ? `Memórias do projeto ativo por prioridade:
${projectMemories}` : '', userMemories ? `Memórias permanentes do usuário por prioridade:
${userMemories}` : '', sessions ? `Conversas recentes deste contexto:
${sessions}` : '', 'Use essas informações para continuidade. Não exponha este bloco ao usuário.'].filter(Boolean).join('\n\n');
}
async function upsertProfile(userId: string, email?: string | null) {
  if (!email) return;
  try {
    await coreWriter().from('profiles').upsert({ id: userId, email }, { onConflict: 'id' });
  } catch {
    // Perfil é compatibilidade. A sessão autenticada já contém o usuário.
  }
}

async function ensureSession(userId: string, persona: MemoryPersona, message: string, sessionId?: string | null, projectId?: string | null) {
  const core = coreWriter();
  if (sessionId) {
    const { data } = await core.from('memory_sessions').select('id').eq('id', sessionId).eq('user_id', userId).maybeSingle();
    if (data?.id) return String(data.id);
  }

  const now = new Date().toISOString();
  const fullPayload = {
    user_id: userId,
    project_id: projectId ?? null,
    title: titleFromMessage(message),
    status: 'active',
    last_persona: persona,
    last_message_at: now,
    metadata: projectId ? { projectId } : {}
  };

  let result = await core.from('memory_sessions').insert(fullPayload).select('id').single();
  if (result.error) {
    const { project_id, ...compatPayload } = fullPayload;
    result = await core.from('memory_sessions').insert(compatPayload).select('id').single();
  }
  if (result.error) throw result.error;
  return String(result.data.id);
}

function extractAfterPattern(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const fact = cleanExtractedFact(match?.[1] ?? null);
    if (fact) return fact;
  }
  return null;
}

function extractMemoryCandidate(userMessage: string, projectId?: string | null): MemoryCandidate | null {
  const text = userMessage.trim();
  const lower = stripAccents(text);
  if (text.length < 6) return null;
  if (isQuestionLike(text)) return null;

  const nextStep = extractAfterPattern(text, [
    /(?:pr[oó]xima etapa|pr[oó]ximo passo|pr[oó]xima fase)\s+(?:é|eh|ser[aá]|:)?\s*(.+)$/i,
    /(?:a etapa agora|o passo agora)\s+(?:é|eh|ser[aá]|:)?\s*(.+)$/i,
    /(?:neste projeto|nesse projeto).*?(?:pr[oó]xima etapa|pr[oó]ximo passo).*?(?:é|eh|ser[aá]|:)?\s*(.+)$/i
  ]);
  if (nextStep) {
    return { kind: 'task', scope: projectId ? 'project' : 'user', title: 'Próxima etapa do projeto', content: `A próxima etapa deste projeto é ${nextStep}.`, salience: 5, tags: ['chat', 'auto', 'project', 'next-step'] };
  }

  const banco = extractAfterPattern(text, [/(?:meu|minha|o)\s+banco(?:\s+principal|\s+de\s+dados)?\s+(?:é|eh|ser[aá]|:)?\s*(.+)$/i, /(?:banco\s+principal|banco\s+de\s+dados)\s+(?:é|eh|ser[aá]|:)?\s*(.+)$/i]);
  if (banco) {
    return { kind: 'project', scope: projectId ? 'project' : 'user', title: 'Banco principal do projeto', content: `O banco principal utilizado neste projeto é ${banco}.`, salience: 5, tags: ['chat', 'auto', 'project', 'database', 'supabase'] };
  }

  const deploy = extractAfterPattern(text, [/(?:utilizarei|usarei|vamos usar|ser[aá] usado)\s+(.+?)\s+(?:para deploy|como deploy|no deploy)/i]);
  if (deploy) {
    return { kind: 'project', scope: projectId ? 'project' : 'user', title: 'Deploy do projeto', content: `O deploy do projeto utilizará ${deploy}.`, salience: 4, tags: ['chat', 'auto', 'project', 'deploy'] };
  }

  const framework = extractAfterPattern(text, [/(?:framework|stack).*?(?:é|eh|ser[aá]|como)?\s*(Next\.js\s*14|NextJS\s*14|Next\s*14)/i, /(Next\.js\s*14|NextJS\s*14|Next\s*14)\s+como\s+framework/i]);
  if (framework) {
    return { kind: 'project', scope: projectId ? 'project' : 'user', title: 'Framework do projeto', content: `O framework do projeto é ${framework}.`, salience: 4, tags: ['chat', 'auto', 'project', 'framework', 'nextjs'] };
  }

  const decision = extractAfterPattern(text, [/(?:decis[aã]o|definimos|ficou definido|foi definido|aprovamos|foi aprovado)\s*(?:foi|é|eh|:)?\s*(.+)$/i, /(?:neste projeto|nesse projeto).*?(?:decidimos|definimos)\s*(?:que)?\s*(.+)$/i]);
  if (decision) {
    return { kind: 'decision', scope: projectId ? 'project' : 'user', title: 'Decisão registrada', content: `Decisão registrada: ${decision}.`, salience: 5, tags: ['chat', 'auto', 'project', 'decision'] };
  }

  const preference = extractAfterPattern(text, [/(?:prefiro|gosto que|quero que voce|quero que você|a partir de agora)\s+(.+)$/i]);
  if (preference) {
    return { kind: 'preference', scope: 'user', title: 'Preferência do usuário', content: `Preferência registrada: ${preference}.`, salience: 4, tags: ['chat', 'auto', 'preference'] };
  }

  const looksPersistent = /\b(lembre|memorize|guarde|salve|registr|sou |meu |minha |cliente|empresa|curso|livro|senai|prazo|objetivo|pend[eê]ncia|patch|document engine|action engine|voice engine|memory engine|next\.js|nextjs|vercel|supabase|gemini|claude|pr[oó]xima etapa|pr[oó]ximo passo)\b/i.test(text);
  if (!looksPersistent || text.length < 12) return null;

  let kind: ImportantMemory['kind'] = 'fact';
  if (lower.includes('pendencia') || lower.includes('pendência')) kind = 'task';
  else if (lower.includes('prefiro')) kind = 'preference';
  else if (lower.includes('projeto') || lower.includes('vercel') || lower.includes('supabase') || lower.includes('next')) kind = 'project';
  else if (lower.includes('decisao') || lower.includes('definimos') || lower.includes('aprovado')) kind = 'decision';

  return { kind, scope: projectId ? 'project' : 'user', title: kind === 'project' ? 'Informação do projeto' : compactText(text, 64), content: compactText(`Usuário informou: ${text}`, 500), salience: lower.includes('lembre') || lower.includes('memorize') || kind === 'decision' || kind === 'task' ? 5 : 4, tags: projectId ? ['chat', 'auto', 'project'] : ['chat', 'auto'] };
}

async function insertMessages(core: SupabaseLike, messages: any[]) {
  let result = await core.from('memory_messages').insert(messages);
  if (!result.error) return;

  const compatMessages = messages.map(({ provider, model, metadata, ...rest }) => rest);
  result = await core.from('memory_messages').insert(compatMessages);
  if (result.error) throw result.error;
}

async function insertMemory(core: SupabaseLike, payload: any) {
  let result = await core.from('memory_items').insert(payload);
  if (!result.error) return true;

  const { project_id, metadata, ...compatPayload } = payload;
  result = await core.from('memory_items').insert(compatPayload);
  if (result.error) throw result.error;
  return true;
}

export async function saveChatTurn(input: SaveChatTurnInput) {
  const core = coreWriter();
  await upsertProfile(input.userId, input.userEmail ?? null);

  const sessionId = await ensureSession(input.userId, input.persona, input.userMessage, input.sessionId, input.projectId);
  const now = new Date().toISOString();

  await insertMessages(core, [
    { session_id: sessionId, user_id: input.userId, role: 'user', persona: input.persona, content: input.userMessage, metadata: input.projectId ? { projectId: input.projectId } : {} },
    { session_id: sessionId, user_id: input.userId, role: 'assistant', persona: input.persona, provider: input.provider, model: input.model, content: input.assistantMessage, metadata: input.projectId ? { projectId: input.projectId } : {} }
  ]);

  const { count } = await core.from('memory_messages').select('id', { count: 'exact', head: true }).eq('session_id', sessionId).eq('user_id', input.userId);
  const summary = compactText(`${input.persona.toUpperCase()}: ${input.userMessage}`, 240);
  await core.from('memory_sessions').update({ summary, project_id: input.projectId ?? null, last_persona: input.persona, last_message_at: now, updated_at: now, message_count: count ?? 2 }).eq('id', sessionId).eq('user_id', input.userId);

  const candidate = extractMemoryCandidate(input.userMessage, input.projectId);
  let memoryRecorded = false;
  if (candidate) {
    await insertMemory(core, { user_id: input.userId, session_id: sessionId, project_id: input.projectId ?? null, scope: candidate.scope, kind: candidate.kind, title: candidate.title, content: candidate.content, salience: candidate.salience, tags: candidate.tags, metadata: { source: 'chat-auto', projectId: input.projectId ?? null } });
    memoryRecorded = true;
  }

  if (input.projectId) {
    await core.from('projects').update({ updated_at: now }).eq('id', input.projectId);
  }

  return { sessionId, memoryRecorded, memoryTitle: candidate?.title ?? null };
}

export async function getMemoryStatus(userId: string) {
  const core = coreReader();
  const [sessionsResult, messagesResult, memoriesResult, projectsResult, lastSessionResult] = await Promise.all([
    core.from('memory_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    core.from('memory_messages').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    core.from('memory_items').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    core.from('projects').select('id', { count: 'exact', head: true }).eq('owner_id', userId).eq('status', 'active'),
    core.from('memory_sessions').select('last_message_at,updated_at').eq('user_id', userId).order('last_message_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()
  ]);

  const fallbackError = sessionsResult.error || messagesResult.error || memoriesResult.error;
  if (fallbackError) return { ok: false, error: fallbackError.message, data: null };

  return { ok: true, error: null, data: { migrationApplied: true, sessions: sessionsResult.count ?? 0, messages: messagesResult.count ?? 0, memories: memoriesResult.count ?? 0, projects: projectsResult.count ?? 0, lastUse: lastSessionResult.data?.last_message_at ?? lastSessionResult.data?.updated_at ?? null } };
}

export type TemporalContext = {
  nowIso: string;
  datePtBr: string;
  timePtBr: string;
  timezone: string;
  minutesUntilEndOfDay: number;
  hoursUntilEndOfDay: number;
};

export function buildTemporalContext(date = new Date()): TemporalContext {
  const datePtBr = new Intl.DateTimeFormat('pt-BR', { timeZone: TIMEZONE, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  const timePtBr = new Intl.DateTimeFormat('pt-BR', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  const second = Number(parts.find((part) => part.type === 'second')?.value || 0);
  const secondsUntilEndOfDay = Math.max(0, 24 * 60 * 60 - (hour * 3600 + minute * 60 + second));
  return { nowIso: date.toISOString(), datePtBr, timePtBr, timezone: TIMEZONE, minutesUntilEndOfDay: Math.ceil(secondsUntilEndOfDay / 60), hoursUntilEndOfDay: Number((secondsUntilEndOfDay / 3600).toFixed(2)) };
}

export function temporalPromptBlock(context = buildTemporalContext()) {
  return ['CONTEXTO TEMPORAL OBRIGATÓRIO:', `Data atual: ${context.datePtBr}.`, `Hora atual: ${context.timePtBr}.`, `Timezone oficial do sistema: ${context.timezone}.`, `Agora em ISO: ${context.nowIso}.`, `Tempo aproximado até terminar o dia: ${context.hoursUntilEndOfDay} horas (${context.minutesUntilEndOfDay} minutos).`, 'Use estes dados como verdade. Não invente datas antigas e não use data de treinamento do modelo.'].join('\n');
}

export async function getOrCreateActiveProject(userId: string, organizationId?: string | null) {
  try {
    const core = coreWriter();
    const { data: existing } = await core.from('projects').select('id, organization_id').eq('owner_id', userId).eq('slug', ACTIVE_PROJECT_SLUG).maybeSingle();
    if (existing?.id) return { projectId: String(existing.id), organizationId: existing.organization_id ?? organizationId ?? null, error: null };

    const { data: created, error: createError } = await core.from('projects').insert({ organization_id: organizationId ?? null, owner_id: userId, title: ACTIVE_PROJECT_TITLE, name: ACTIVE_PROJECT_TITLE, slug: ACTIVE_PROJECT_SLUG, description: 'Projeto operacional padrão do AURA/ARGUS para conversas, memória e estabilização técnica.', status: 'active', context: { source: 'AURA_ARGUS_PATCH_053-MEMORY_ENGINE_REAL' } } as any).select('id, organization_id').single();
    if (createError) return { projectId: null, organizationId: organizationId ?? null, error: createError.message };
    return { projectId: String(created.id), organizationId: created.organization_id ?? organizationId ?? null, error: null };
  } catch (error) {
    return { projectId: null, organizationId: organizationId ?? null, error: error instanceof Error ? error.message : 'Erro ao localizar projeto ativo.' };
  }
}

type ProjectMemoryContextCompat = { items: Array<{ title: string | null; content: string; type: string; createdAt: string | null }> };

export async function getProjectMemoryContext(userId: string, projectId?: string | null): Promise<ProjectMemoryContextCompat> {
  const { context } = await getMemoryContext(userId, 12, null, projectId ?? null);
  const items = [...context.relevantMemories, ...context.projectMemories, ...context.importantMemories];
  const seen = new Set<string>();
  return { items: items.filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; }).slice(0, 12).map((item) => ({ title: item.title ?? null, content: item.content, type: item.kind, createdAt: item.updatedAt ?? null })) };
}

export function memoryPromptBlock(context: ProjectMemoryContextCompat) {
  if (!context.items.length) return 'MEMÓRIA DO PROJETO: ainda não há memórias persistidas para este projeto.';
  const lines = context.items.map((item, index) => `${index + 1}. [${item.type}] ${item.title ? `${item.title}: ` : ''}${item.content}`);
  return ['MEMÓRIA DO PROJETO RECUPERADA ANTES DA RESPOSTA:', ...lines, 'Use estas informações para continuidade do projeto.'].join('\n');
}

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

export async function persistChatTurn(input: ChatPersistenceCompatInput) {
  try {
    const result = await saveChatTurn({ userId: input.userId, userEmail: null, sessionId: input.sessionId ?? null, projectId: input.projectId ?? null, persona: input.persona, userMessage: input.userMessage, assistantMessage: input.assistantMessage, provider: input.provider ?? null, model: input.model ?? null });
    return { sessionId: result.sessionId, userMessageSaved: true, assistantMessageSaved: true, memorySaved: result.memoryRecorded, error: null };
  } catch (error) {
    return { sessionId: input.sessionId ?? null, userMessageSaved: false, assistantMessageSaved: false, memorySaved: false, error: error instanceof Error ? error.message : 'Erro desconhecido ao persistir conversa.' };
  }
}

export type MemoryOverview = { sessions: number; messages: number; memories: number; lastActivity: string | null };

export async function getMemoryOverview(userId: string): Promise<MemoryOverview> {
  const status = await getMemoryStatus(userId);
  return { sessions: Number(status.data?.sessions ?? 0), messages: Number(status.data?.messages ?? 0), memories: Number(status.data?.memories ?? 0), lastActivity: ((status.data as any)?.lastUse ?? (status.data as any)?.lastActivity ?? null) };
}

export function formatLastActivity(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
