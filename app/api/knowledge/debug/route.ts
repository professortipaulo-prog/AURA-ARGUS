import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getKnowledgeContext } from '@/lib/knowledge/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sessao invalida ou expirada.' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q') ?? 'experiencia profissional carreira';

  const admin = createSupabaseAdminClient();
  const { data: files, error } = await admin
    .schema('core')
    .from('knowledge_files')
    .select('id, file_name, mime_type, size_bytes, extraction_status, extraction_error, extracted_text, created_at')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const filesSummary = (files ?? []).map((file: any) => ({
    id: file.id,
    fileName: file.file_name,
    mimeType: file.mime_type,
    sizeBytes: file.size_bytes,
    extractionStatus: file.extraction_status,
    extractionError: file.extraction_error,
    extractedTextPreview: file.extracted_text ? String(file.extracted_text).slice(0, 300) : null,
    extractedTextLength: file.extracted_text ? String(file.extracted_text).length : 0,
    createdAt: file.created_at
  }));

  const contextForQuery = await getKnowledgeContext(session.userId, query);

  return NextResponse.json({
    ok: true,
    query,
    files: filesSummary,
    contextFoundForQuery: contextForQuery,
    contextIsNull: contextForQuery === null
  });
}
