import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function saveFaceDescriptor(userId: string, descriptor: number[]): Promise<{ ok: boolean; error: string | null }> {
  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return { ok: false, error: 'Descritor facial invalido (esperado vetor de 128 numeros).' };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .schema('core')
    .from('face_enrollments')
    .upsert(
      { user_id: userId, descriptor, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}

export async function getFaceEnrollmentStatus(userId: string): Promise<{ enrolled: boolean; enrolledAt: string | null }> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('core')
    .from('face_enrollments')
    .select('created_at')
    .eq('user_id', userId)
    .maybeSingle();

  return { enrolled: Boolean(data), enrolledAt: data?.created_at ?? null };
}

export async function deleteFaceEnrollment(userId: string): Promise<{ ok: boolean; error: string | null }> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.schema('core').from('face_enrollments').delete().eq('user_id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
