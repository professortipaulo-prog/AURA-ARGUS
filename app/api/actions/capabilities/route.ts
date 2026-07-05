import { NextResponse } from 'next/server';
import { ACTION_CAPABILITIES } from '@/lib/actions/capabilities';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    engine: 'Action Engine',
    version: '0.1.0',
    capabilities: ACTION_CAPABILITIES
  });
}
