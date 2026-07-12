import { NextRequest, NextResponse } from 'next/server';
import { getBetaStatus, type BetaProgram } from '@/lib/beta/signup';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const program = (request.nextUrl.searchParams.get('program') as BetaProgram) === 'worker' ? 'worker' : 'estudantil';
  const status = await getBetaStatus(program);
  return NextResponse.json(status);
}
