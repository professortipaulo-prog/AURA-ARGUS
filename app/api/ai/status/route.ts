import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/ai/ai-router';

export async function GET() {
  // Retorna apenas booleanos de configuração e o modelo padrão de cada
  // provedor — nenhuma chave de API é lida ou exposta nesta rota.
  const status = getStatus();
  return NextResponse.json(status);
}
