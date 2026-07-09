import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const BORDER_NAMES: Record<'aura' | 'argus', Record<1 | 2, string>> = {
  aura: { 1: 'Ondas azuis', 2: 'Floral azul' },
  argus: { 1: 'Circuito', 2: 'Hexagonal' }
};

const BORDER_KEYWORDS: Record<'aura' | 'argus', { variant: 1 | 2; keywords: string[] }[]> = {
  aura: [
    { variant: 1, keywords: ['onda', 'ondas', 'variante 1', 'opção 1', 'opcao 1', 'primeira', 'padrão', 'padrao'] },
    { variant: 2, keywords: ['floral', 'flor', 'variante 2', 'opção 2', 'opcao 2', 'segunda'] }
  ],
  argus: [
    { variant: 1, keywords: ['circuito', 'variante 1', 'opção 1', 'opcao 1', 'primeira', 'padrão', 'padrao'] },
    { variant: 2, keywords: ['hexagonal', 'hexágono', 'hexagono', 'variante 2', 'opção 2', 'opcao 2', 'segunda'] }
  ]
};

export function detectBorderChoiceInMessage(message: string, persona: 'aura' | 'argus'): 1 | 2 | null {
  const lower = message.toLowerCase();
  for (const entry of BORDER_KEYWORDS[persona]) {
    if (entry.keywords.some((keyword) => lower.includes(keyword))) return entry.variant;
  }
  // Aceita tambem so o numero, quando a mensagem for curta (resposta direta)
  if (/^\s*1\s*$/.test(message)) return 1;
  if (/^\s*2\s*$/.test(message)) return 2;
  return null;
}

export async function savePendingDocumentRequest(params: {
  userId: string;
  persona: 'aura' | 'argus';
  title: string;
  topic: string;
  format: string;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.schema('core').from('chat_pending_document').upsert(
    {
      user_id: params.userId,
      persona: params.persona,
      title: params.title,
      topic: params.topic,
      format: params.format,
      created_at: new Date().toISOString()
    },
    { onConflict: 'user_id,persona' }
  );
}

export async function getPendingDocumentRequest(userId: string, persona: 'aura' | 'argus') {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('core')
    .from('chat_pending_document')
    .select('title, topic, format, created_at')
    .eq('user_id', userId)
    .eq('persona', persona)
    .maybeSingle();

  if (!data) return null;

  // Pedido pendente expira em 15 minutos -- evita que uma resposta de
  // borda "solta", dias depois, dispare a criacao de um documento antigo
  // que o usuario ja nem lembra mais.
  const ageMs = Date.now() - new Date(data.created_at).getTime();
  if (ageMs > 15 * 60 * 1000) return null;

  return { title: data.title as string, topic: data.topic as string, format: data.format as string };
}

export async function clearPendingDocumentRequest(userId: string, persona: 'aura' | 'argus'): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.schema('core').from('chat_pending_document').delete().eq('user_id', userId).eq('persona', persona);
}
