import { NextRequest, NextResponse } from 'next/server';
import { executeAction } from '@/lib/actions/server';
import type { ExecuteActionRequest } from '@/lib/actions/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as ExecuteActionRequest;
    const result = await executeAction(payload);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no Action Engine.';
    return NextResponse.json({ ok: false, status: 'failed', message }, { status: 500 });
  }
}
