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
    return { projects: ensured ? [ensured] : [], activeProject: ensured };
  }

  const projects = Array.isArray(data) ? data.map(normalizeProject).filter((project) => project.id) : [];
  const activeProject = projects[0] ?? ensured ?? null;
  return { projects: projects.length ? projects : ensured ? [ensured] : [], activeProject };
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
