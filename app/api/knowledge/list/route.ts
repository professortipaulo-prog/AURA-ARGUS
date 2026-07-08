import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listKnowledgeFiles } from '@/lib/knowledge/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });
  }

  const files = await listKnowledgeFiles(session.userId);
  return NextResponse.json({ ok: true, files });
}
