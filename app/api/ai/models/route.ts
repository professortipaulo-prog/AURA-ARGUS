import { NextResponse } from 'next/server';
import { getModelInventory } from '@/lib/ai/ai-router';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';
  const inventory = await getModelInventory(refresh);
  return NextResponse.json(inventory);
}
