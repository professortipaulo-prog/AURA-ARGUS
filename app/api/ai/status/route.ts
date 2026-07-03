import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/ai/ai-router';

export async function GET() {
  const status = await getStatus();
  return NextResponse.json(status);
}
