import { GoogleGenerativeAI } from '@google/generative-ai';

const EMBEDDING_MODEL = 'text-embedding-004'; // 768 dimensoes, compativel com a versao instalada do SDK

/**
 * Gera o vetor de embedding (768 numeros) de um texto, usando o modelo
 * de embeddings do Google. Retorna null em caso de falha (chave ausente,
 * erro de rede, texto vazio) -- quem chama deve tratar isso como
 * "sem embedding disponivel", nao como erro fatal.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey || !text.trim()) return null;

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
    // O modelo aceita ate ~2048 tokens por texto -- corta para um tamanho
    // seguro (aprox. 8000 caracteres) para nao estourar o limite em
    // documentos grandes.
    const result = await model.embedContent(text.slice(0, 8000));
    return result.embedding?.values ?? null;
  } catch {
    return null;
  }
}
