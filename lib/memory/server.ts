import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_ORGANIZATION_ID } from '@/lib/auth/constants';
import type { ChatPersistenceInput, MemoryOverview, PersistedChatTurn, ProjectMemoryContext, TemporalContext } from './types';

const ACTIVE_PROJECT_TITLE = 'AURA/ARGUS';
const ACTIVE_PROJECT_SLUG = 'aura-argus';
const TIMEZONE = process.env.AURA_ARGUS_TIMEZONE || 'America/Bahia';

type SupabaseAny = ReturnType<typeof createSupabaseAdminClient>;

function aiProviderName(provider: string) {
  return provider === 'gemini' ? 'google' : 'anthropic';
}

function isSchemaError(error?: { message?: string } | null) {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('schema must be one of') || message.includes('invalid schema') || message.includes('not found');
}

function startOfTodayInTimezone() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}T00:00:00`;
}

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

  const localParts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const hour = Number(localParts.find((p) => p.type === 'hour')?.value || 0);
  const minute = Number(localParts.find((p) => p.type === 'minute')?.value || 0);
  const second = Number(localParts.find((p) => p.type === 'second')?.value || 0);
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

async function ensureProject(admin: SupabaseAny, userId: string, organizationId: string | null) {
  const core = admin.schema('core');
  const orgId = organizationId || DEFAULT_ORGANIZATION_ID;

  const { data: existing, error: existingError } = await core
    .from('projects')
    .select('id, organization_id')
    .eq('owner_id', userId)
    .eq('slug', ACTIVE_PROJECT_SLUG)
    .maybeSingle();

  if (existing?.id) return { projectId: existing.id as string, organizationId: (existing.organization_id as string | null) || orgId, error: null };
  if (existingError && !isSchemaError(existingError)) {
    return { projectId: null, organizationId: orgId, error: existingError.message };
  }

  const { data: created, error: createError } = await core
    .from('projects')
    .insert({
      organization_id: orgId,
      owner_id: userId,
      title: ACTIVE_PROJECT_TITLE,
      slug: ACTIVE_PROJECT_SLUG,
      description: 'Projeto operacional padrão do AURA/ARGUS para conversas, memória e estabilização técnica.',
      context: { source: 'PATCH-046-MEMORY-UI-STABILIZATION' }
    })
    .select('id, organization_id')
    .single();

  if (createError) return { projectId: null, organizationId: orgId, error: createError.message };
  return { projectId: created.id as string, organizationId: (created.organization_id as string | null) || orgId, error: null };
}

export async function getOrCreateActiveProject(userId: string, organizationId: string | null) {
  const admin = createSupabaseAdminClient();
  return ensureProject(admin, userId, organizationId);
}

export async function getProjectMemoryContext(userId: string, projectId?: string | null): Promise<ProjectMemoryContext> {
  try {
    const admin = createSupabaseAdminClient();
    const memory = admin.schema('memory');
    let query = memory
      .from('items')
      .select('title, content, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) return { items: [] };

    return {
      items: (data || []).map((item: any) => ({
        title: item.title ?? null,
        content: item.content,
        type: item.type,
        createdAt: item.created_at ?? null
      }))
    };
  } catch {
    return { items: [] };
  }
}

export function memoryPromptBlock(context: ProjectMemoryContext) {
  if (!context.items.length) {
    return 'MEMÓRIA DO PROJETO: ainda não há memórias persistidas para este projeto.';
  }

  const lines = context.items.map((item, index) => `${index + 1}. [${item.type}] ${item.title ? `${item.title}: ` : ''}${item.content}`);
  return ['MEMÓRIA DO PROJETO RECUPERADA ANTES DA RESPOSTA:', ...lines].join('\n');
}

function shouldSaveAsProjectMemory(message: string) {
  const text = message.toLowerCase();
  return (
    text.includes('neste projeto') ||
    text.includes('nesse projeto') ||
    text.includes('próxima etapa') ||
    text.includes('proxima etapa') ||
    text.includes('lembre') ||
    text.includes('memorize') ||
    text.includes('salve') ||
    text.includes('guardar')
  );
}

export async function persistChatTurn(input: ChatPersistenceInput): Promise<PersistedChatTurn> {
  try {
    const admin = createSupabaseAdminClient();
    const ai = admin.schema('ai');
    const memory = admin.schema('memory');
    const project = input.projectId
      ? { projectId: input.projectId, organizationId: input.organizationId, error: null }
      : await ensureProject(admin, input.userId, input.organizationId);

    if (!project.projectId) {
      return { sessionId: null, userMessageSaved: false, assistantMessageSaved: false, memorySaved: false, error: project.error || 'Projeto ativo não encontrado.' };
    }

    let sessionId = input.sessionId || null;

    if (!sessionId) {
      const { data: createdSession, error: sessionError } = await ai
        .from('sessions')
        .insert({
          organization_id: project.organizationId,
          project_id: project.projectId,
          user_id: input.userId,
          title: input.userMessage.slice(0, 80),
          context_snapshot: {
            persona: input.persona,
            provider: input.provider,
            model: input.model,
            timezone: TIMEZONE,
            patch: 'PATCH-046-MEMORY-UI-STABILIZATION'
          }
        })
        .select('id')
        .single();

      if (sessionError) {
        return { sessionId: null, userMessageSaved: false, assistantMessageSaved: false, memorySaved: false, error: sessionError.message };
      }
      sessionId = createdSession.id as string;
    }

    const providerName = aiProviderName(input.provider);

    const { error: userMessageError } = await ai.from('messages').insert({
      session_id: sessionId,
      user_id: input.userId,
      role: 'user',
      content: input.userMessage,
      provider: providerName,
      model: input.model,
      metadata: { persona: input.persona, project_id: project.projectId }
    });

    const { error: assistantMessageError } = await ai.from('messages').insert({
      session_id: sessionId,
      user_id: input.userId,
      role: 'assistant',
      content: input.assistantMessage,
      provider: providerName,
      model: input.model,
      latency_ms: input.latencyMs ?? null,
      metadata: { persona: input.persona, project_id: project.projectId }
    });

    const shouldSaveMemory = shouldSaveAsProjectMemory(input.userMessage);
    let memorySaved = false;
    let memoryError: string | null = null;

    if (shouldSaveMemory) {
      const { error } = await memory.from('items').insert({
        organization_id: project.organizationId,
        project_id: project.projectId,
        user_id: input.userId,
        type: 'project',
        title: 'Memória de conversa do projeto',
        content: input.userMessage,
        source: 'chat',
        importance: 4,
        metadata: {
          persona: input.persona,
          provider: input.provider,
          model: input.model,
          session_id: sessionId,
          patch: 'PATCH-046-MEMORY-UI-STABILIZATION'
        }
      });
      memorySaved = !error;
      memoryError = error?.message || null;
    }

    const { error: updateSessionError } = await ai
      .from('sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return {
      sessionId,
      userMessageSaved: !userMessageError,
      assistantMessageSaved: !assistantMessageError,
      memorySaved,
      error: userMessageError?.message || assistantMessageError?.message || memoryError || updateSessionError?.message || null
    };
  } catch (error) {
    return {
      sessionId: null,
      userMessageSaved: false,
      assistantMessageSaved: false,
      memorySaved: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao persistir conversa.'
    };
  }
}

async function safeCount(schemaClient: any, table: string, userId: string, column = 'user_id') {
  const { count, error } = await schemaClient
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, userId);
  if (error) return 0;
  return count ?? 0;
}

export async function getMemoryOverview(userId: string): Promise<MemoryOverview> {
  try {
    const admin = createSupabaseAdminClient();
    const ai = admin.schema('ai');
    const memory = admin.schema('memory');

    const [sessions, messages, memories] = await Promise.all([
      safeCount(ai, 'sessions', userId),
      safeCount(ai, 'messages', userId),
      safeCount(memory, 'items', userId)
    ]);

    const { data: lastMessage } = await ai
      .from('messages')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: lastMemory } = await memory
      .from('items')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastActivity = [lastMessage?.created_at, lastMemory?.created_at].filter(Boolean).sort().at(-1) ?? null;

    return { sessions, messages, memories, lastActivity };
  } catch {
    return { sessions: 0, messages: 0, memories: 0, lastActivity: null };
  }
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

export async function getMemoryContext(userId: string, limit = 12) {
  try {
    const admin = createSupabaseAdminClient();
    const memory = admin.schema('memory');

    const { data, error } = await memory
      .from('items')
      .select('id,title,content,type,source,importance,project_id,metadata,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { items: [], memories: [], context: [], error: error.message };
    }

    const items = data ?? [];
    return {
      items,
      memories: items,
      context: items,
      error: null
    };
  } catch (error) {
    return {
      items: [],
      memories: [],
      context: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido ao recuperar memória.'
    };
  }
}

export async function getMemoryStatus(userId: string) {
  try {
    const overview = await getMemoryOverview(userId);
    return {
      ok: true,
      data: {
        operational: true,
        timezone: TIMEZONE,
        sessions: overview.sessions,
        messages: overview.messages,
        memories: overview.memories,
        lastActivity: overview.lastActivity,
        patch: 'PATCH-046-MEMORY-UI-STABILIZATION'
      },
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao consultar status da memória.'
    };
  }
}
