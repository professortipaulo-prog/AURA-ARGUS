import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { saveKnowledgeFile } from '@/lib/knowledge/server';

export const dynamic = 'force-dynamic';

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB, limite razoavel para PDFs/Word pessoais

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('projectId');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ ok: false, error: `Arquivo muito grande (maximo ${MAX_SIZE_BYTES / (1024 * 1024)}MB).` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await saveKnowledgeFile({
      userId: session.userId,
      projectId: typeof projectId === 'string' && projectId.trim() ? projectId : null,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      buffer
    });

    return NextResponse.json({ ok: true, file: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao enviar arquivo.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
