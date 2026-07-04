import { NextResponse } from 'next/server';
import { createUserProject, getAuthenticatedUserId, listUserProjects } from '@/lib/projects/server';

export async function GET() {
  const { userId, error } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  const result = await listUserProjects(userId);
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const { userId, error } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  let body: { name?: string; description?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length < 3) {
    return NextResponse.json({ ok: false, error: 'Informe um nome de projeto com pelo menos 3 caracteres.' }, { status: 400 });
  }

  try {
    const project = await createUserProject(userId, name, body.description ?? null);
    return NextResponse.json({ ok: true, project });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Não foi possível criar o projeto.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
