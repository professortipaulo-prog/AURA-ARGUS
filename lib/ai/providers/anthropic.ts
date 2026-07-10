/**
 * Provider real da Anthropic.
 * O modelo deve chegar já resolvido pelo AI Provider Manager.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AIProviderAdapter } from '../types';

const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || 'auto';

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada.');
  }
  return new Anthropic({ apiKey });
}

export const anthropicProvider: AIProviderAdapter = {
  id: 'anthropic',
  defaultModel: DEFAULT_MODEL,

  isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async send(message: string, model: string, systemPrompt?: string): Promise<string> {
    const client = getClient();

    const response = await client.messages.create(
      {
        model,
        max_tokens: 1500,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [{ role: 'user', content: message }],
        // Busca na web nativa da Anthropic (executada pelo servidor da
        // própria Anthropic — não precisa de chave nova nem de outro
        // provedor). O modelo decide sozinho quando vale a pena buscar.
        //
        // web_fetch permite abrir e ler o conteudo real de um link
        // especifico que o usuario cole na mensagem (ex: um video do
        // YouTube, um artigo) -- sem isso, o modelo so consegue *buscar*
        // por paginas indexadas, nao *abrir* uma URL exata que o usuario
        // compartilhou. So funciona para URLs que ja apareceram na
        // propria conversa (protecao de seguranca da Anthropic).
        tools: [
          { type: 'web_search_20250305', name: 'web_search' } as unknown as Anthropic.Tool,
          { type: 'web_fetch_20250910', name: 'web_fetch', max_uses: 5 } as unknown as Anthropic.Tool
        ]
      },
      { headers: { 'anthropic-beta': 'web-fetch-2025-09-10' } }
    );

    // Com busca na web habilitada, a resposta pode ter vários blocos de
    // texto intercalados com blocos de busca/uso de ferramenta — juntamos
    // todos os blocos de texto, na ordem, para não truncar a resposta.
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n\n')
      .trim();

    if (!text) {
      throw new Error('Resposta da Anthropic sem conteúdo de texto.');
    }
    return text;
  }
};
