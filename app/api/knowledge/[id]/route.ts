import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { deleteKnowledgeFile } from '@/lib/knowledge/server';

export const dynamic = 'force-dynamic';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });
  }

  if (!params.id) {
    return NextResponse.json({ ok: false, error: 'ID do arquivo obrigatorio.' }, { status: 400 });
  }

  try {
    await deleteKnowledgeFile(session.userId, params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao remover arquivo.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
