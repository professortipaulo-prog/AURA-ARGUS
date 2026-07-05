import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProjectListResponse, ProjectSummary } from './types';

function normalizeProject(input: any): ProjectSummary {
  return {
    id: String(input?.id ?? ''),
    name: String(input?.name ?? 'Projeto sem nome'),
    slug: String(input?.slug ?? ''),
    description: input?.description ?? null,
    status: (input?.status ?? 'active') as ProjectSummary['status'],
    color: input?.color ?? null,
    icon: input?.icon ?? null,
    createdAt: input?.createdAt ?? input?.created_at ?? null,
    updatedAt: input?.updatedAt ?? input?.updated_at ?? null,
    lastActivityAt: input?.lastActivityAt ?? input?.last_activity_at ?? null,
    memoryCount: Number(input?.memoryCount ?? input?.memory_count ?? 0),
    sessionCount: Number(input?.sessionCount ?? input?.session_count ?? 0)
  };
}

async function withProjectCounters(userId: string, project: ProjectSummary): Promise<ProjectSummary> {
  if (!project.id) return project;
  const core = createSupabaseServerClient().schema('core');
  const [memoryResult, sessionResult, latestMemoryResult, latestSessionResult] = await Promise.all([
    core.from('memory_items').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('project_id', project.id),
    core.from('memory_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('project_id', project.id).neq('status', 'deleted'),
    core.from('memory_items').select('updated_at').eq('user_id', userId).eq('project_id', project.id).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    core.from('memory_sessions').select('last_message_at,updated_at').eq('user_id', userId).eq('project_id', project.id).neq('status', 'deleted').order('updated_at', { ascending: false }).limit(1).maybeSingle()
  ]);

  const latestMemory = latestMemoryResult.data?.updated_at ?? null;
  const latestSession = latestSessionResult.data?.last_message_at ?? latestSessionResult.data?.updated_at ?? null;
  const lastActivityAt = latestSession ?? latestMemory ?? project.lastActivityAt ?? project.updatedAt ?? null;

  return {
    ...project,
    memoryCount: memoryResult.error ? project.memoryCount : memoryResult.count ?? project.memoryCount,
    sessionCount: sessionResult.error ? project.sessionCount : sessionResult.count ?? project.sessionCount,
    lastActivityAt
  };
}

async function listUserProjectsFallback(userId: string, ensured: ProjectSummary | null): Promise<ProjectListResponse> {
  const core = createSupabaseServerClient().schema('core');
  const { data, error } = await core
    .from('projects')
    .select('id,name,title,slug,description,status,color,icon,created_at,updated_at')
    .eq('owner_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (error) {
    const fallbackProjects = ensured ? [await withProjectCounters(userId, ensured)] : [];
    return { projects: fallbackProjects, activeProject: fallbackProjects[0] ?? ensured };
  }

  const rawProjects = Array.isArray(data) ? data.map(normalizeProject).filter((project) => project.id) : [];
  const countedProjects = await Promise.all(rawProjects.map((project) => withProjectCounters(userId, project)));
  const projects = countedProjects.length ? countedProjects : ensured ? [await withProjectCounters(userId, ensured)] : [];
  return { projects, activeProject: projects[0] ?? null };
}

export async function getAuthenticatedUserId() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return { userId: null, error: error?.message ?? 'Não autenticado.' };
  }

  return { userId: user.id, error: null };
}

export async function ensureDefaultProject(userId: string): Promise<ProjectSummary | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('ensure_default_project', { p_user_id: userId });

  if (error) {
    return null;
  }

  return data ? normalizeProject(data) : null;
}

export async function listUserProjects(userId: string): Promise<ProjectListResponse> {
  const supabase = createSupabaseServerClient();
  const ensured = await ensureDefaultProject(userId);
  const { data, error } = await supabase.rpc('list_user_projects', { p_user_id: userId });

  if (error) {
    return listUserProjectsFallback(userId, ensured);
  }

  const projects = Array.isArray(data) ? data.map(normalizeProject).filter((project) => project.id) : [];
  const countedProjects = await Promise.all(projects.map((project) => withProjectCounters(userId, project)));
  const fallbackEnsured = ensured ? await withProjectCounters(userId, ensured) : null;
  const activeProject = countedProjects[0] ?? fallbackEnsured ?? null;
  return { projects: countedProjects.length ? countedProjects : fallbackEnsured ? [fallbackEnsured] : [], activeProject };
}

export async function createUserProject(userId: string, name: string, description?: string | null): Promise<ProjectSummary> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('create_user_project', {
    p_user_id: userId,
    p_name: name,
    p_description: description ?? null
  });

  if (error) {
    throw error;
  }

  return normalizeProject(data);
}
