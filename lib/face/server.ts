import { createSupabaseAdminClient } from '@/lib/supabase/admin';

// O limiar "oficial" recomendado pelo face-api.js e 0.6, mas dados reais
// de uso (PATCH_103/104: 13 tentativas legitimas do dono da conta, todas
// entre 0.76 e 0.80) mostraram que isso era severo demais entre sessoes
// diferentes (iluminacao/camera/angulo variam). Como este e um atalho
// OPCIONAL de conveniencia -- nunca a unica forma de entrar -- um limiar
// mais tolerante e um trade-off aceitavel aqui (mais tolerante a variacao
// da mesma pessoa, sem chegar perto da faixa tipica de pessoa diferente,
// que costuma ficar acima de 1.0).
const MATCH_THRESHOLD = 0.85;

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export async function verifyFaceDescriptor(userId: string, descriptor: number[]): Promise<{ matched: boolean; distance: number | null; enrolled: boolean }> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('core')
    .from('face_enrollments')
    .select('descriptor')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data?.descriptor) return { matched: false, distance: null, enrolled: false };

  const stored = data.descriptor as number[];
  if (!Array.isArray(stored) || stored.length !== descriptor.length) {
    return { matched: false, distance: null, enrolled: true };
  }

  const distance = euclideanDistance(stored, descriptor);
  return { matched: distance <= MATCH_THRESHOLD, distance, enrolled: true };
}

export async function logFaceVerification(params: { userId: string; matched: boolean; distance: number | null; identificationNote?: string | null }): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.schema('core').from('face_verification_log').insert({
    user_id: params.userId,
    matched: params.matched,
    distance: params.distance,
    identification_note: params.identificationNote ?? null
  });
}

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

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('core')
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  return data?.id ?? null;
}
