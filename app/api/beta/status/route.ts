import { NextResponse } from 'next/server';
import { getBetaStatus } from '@/lib/beta/signup';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getBetaStatus();
  return NextResponse.json(status);
}
