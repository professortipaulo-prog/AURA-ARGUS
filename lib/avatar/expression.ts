export type AvatarExpression = 'talking' | 'smiling' | 'serious';

const SERIOUS_PATTERNS = [
  'não sei', 'nao sei', 'não tenho essa informa', 'nao tenho essa informa',
  'não encontrei', 'nao encontrei', 'não consegui', 'nao consegui',
  'preciso de mais informa', 'não é possível', 'nao e possivel',
  'infelizmente', 'não posso ajudar', 'nao posso ajudar', 'não localizei',
  'nao localizei', 'sem informações suficientes', 'sem informacoes suficientes',
  'não há registro', 'nao ha registro', 'não temos registro'
];

const SMILING_PATTERNS = [
  'concluí', 'conclui', 'pronto!', 'feito!', 'consegui', 'aqui está', 'aqui esta',
  'tudo certo', 'com certeza', 'perfeito', 'ótimo', 'otimo', 'sucesso',
  'foi um prazer', 'fico feliz', 'que bom', 'excelente', 'parabéns', 'parabens'
];

/**
 * Classifica o tom de uma resposta da IA para decidir qual expressao do
 * avatar mostrar enquanto ela fala. Heuristica por palavra-chave (v1) --
 * nao e analise de sentimento real, mas cobre bem os casos mais comuns:
 * incerteza/falta de informacao (serious), conclusao positiva (smiling),
 * e o padrao neutro (talking) para o resto.
 */
export function classifyExpression(text: string): AvatarExpression {
  const lower = text.toLowerCase();
  if (SERIOUS_PATTERNS.some((pattern) => lower.includes(pattern))) return 'serious';
  if (SMILING_PATTERNS.some((pattern) => lower.includes(pattern))) return 'smiling';
  return 'talking';
}
