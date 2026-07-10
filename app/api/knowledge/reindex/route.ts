import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { reindexKnowledgeEmbeddings } from '@/lib/knowledge/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });

  const result = await reindexKnowledgeEmbeddings(session.userId);
  return NextResponse.json({ ok: true, ...result });
}
