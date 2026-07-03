import { NextResponse } from 'next/server';
import { getAvailableModels } from '@/lib/ai/ai-router';

export async function GET() {
  const models = await getAvailableModels();
  return NextResponse.json(models);
}
