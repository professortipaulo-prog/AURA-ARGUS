import type { AIPersonaId, AIProviderId } from './types';

export type AIRouterComplexity = 'low' | 'medium' | 'high';
export type AIRouterTaskType =
  | 'conversation'
  | 'strategy'
  | 'technical'
  | 'code'
  | 'document'
  | 'analysis'
  | 'automation'
  | 'research';

export interface AIRouterInput {
  message: string;
  persona?: AIPersonaId;
  provider?: AIProviderId;
  model?: string;
}

export interface AIRouteDecision {
  provider: AIProviderId;
  requestedProvider?: AIProviderId;
  model?: string;
  taskType: AIRouterTaskType;
  complexity: AIRouterComplexity;
  reason: string;
  fallbackOrder: AIProviderId[];
  explicitProvider: boolean;
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function estimateComplexity(message: string): AIRouterComplexity {
  const text = message.toLowerCase();
  const length = message.trim().length;

  const highSignals = [
    'arquitetura',
    'implemente',
    'corrija',
    'debug',
    'erro',
    'sql',
    'supabase',
    'vercel',
    'api',
    'backend',
    'frontend',
    'next',
    'typescript',
    'documento completo',
    'relatório completo',
    'analise minuciosamente',
    'parecer técnico'
  ];

  const mediumSignals = [
    'resuma',
    'organize',
    'planeje',
    'roteiro',
    'checklist',
    'melhore',
    'revisar',
    'documentação',
    'curso',
    'projeto'
  ];

  if (length > 1200 || includesAny(text, highSignals)) return 'high';
  if (length > 280 || includesAny(text, mediumSignals)) return 'medium';
  return 'low';
}

function classifyTask(message: string): AIRouterTaskType {
  const text = message.toLowerCase();

  if (includesAny(text, ['código', 'codigo', 'typescript', 'javascript', 'next', 'react', 'sql', 'api', 'erro', 'bug', 'deploy', 'vercel', 'supabase'])) {
    return 'code';
  }

  if (includesAny(text, ['automatizar', 'ação', 'executar', 'workflow', 'gmail', 'drive', 'onedrive', 'teams', 'whatsapp', 'notebooklm'])) {
    return 'automation';
  }

  if (includesAny(text, ['documento', 'docx', 'pdf', 'excel', 'powerpoint', 'ppt', 'relatório', 'parecer', 'descritivo', 'manual'])) {
    return 'document';
  }

  if (includesAny(text, ['analise', 'análise', 'diagnóstico', 'risco', 'validar', 'verifique', 'comparar'])) {
    return 'analysis';
  }

  if (includesAny(text, ['pesquise', 'pesquisa', 'fonte', 'referência', 'referencias', 'notícia', 'atual'])) {
    return 'research';
  }

  if (includesAny(text, ['estratégia', 'planejamento', 'roadmap', 'prioridade', 'decisão', 'gestão'])) {
    return 'strategy';
  }

  return 'conversation';
}

function defaultProviderFor(taskType: AIRouterTaskType, complexity: AIRouterComplexity, persona?: AIPersonaId): AIProviderId {
  if (persona === 'aura') return 'anthropic';
  if (persona === 'argus') return 'gemini';

  if (taskType === 'code' || taskType === 'automation' || taskType === 'analysis') return 'gemini';
  if (taskType === 'document' || taskType === 'strategy') return 'anthropic';
  if (complexity === 'high') return 'anthropic';
  return 'gemini';
}

function reasonFor(provider: AIProviderId, taskType: AIRouterTaskType, complexity: AIRouterComplexity, persona?: AIPersonaId, explicitProvider = false) {
  if (explicitProvider) return `Provedor solicitado explicitamente pelo cliente: ${provider}.`;

  if (persona === 'aura') return 'AURA prioriza respostas estratégicas, escrita, organização e comunicação; rota preferencial Anthropic.';
  if (persona === 'argus') return 'ARGUS prioriza análise operacional, execução técnica, automação e supervisão; rota preferencial Gemini.';

  return `Roteamento automático por tarefa (${taskType}) e complexidade (${complexity}).`;
}

export function decideAIRoute(input: AIRouterInput): AIRouteDecision {
  const taskType = classifyTask(input.message);
  const complexity = estimateComplexity(input.message);
  const explicitProvider = input.provider === 'anthropic' || input.provider === 'gemini';
  const provider = explicitProvider ? input.provider! : defaultProviderFor(taskType, complexity, input.persona);
  const secondary: AIProviderId = provider === 'anthropic' ? 'gemini' : 'anthropic';

  return {
    provider,
    requestedProvider: input.provider,
    model: input.model,
    taskType,
    complexity,
    reason: reasonFor(provider, taskType, complexity, input.persona, explicitProvider),
    fallbackOrder: [provider, secondary],
    explicitProvider
  };
}

export function getRouterPolicySummary() {
  return {
    name: 'AURA/ARGUS AI Router',
    version: '042',
    rules: [
      'AURA roteia preferencialmente para Anthropic.',
      'ARGUS roteia preferencialmente para Gemini.',
      'Provedor explícito no cliente prevalece sobre a regra automática.',
      'Em falha do provedor principal, o router tenta o provedor secundário configurado.',
      'A decisão registra tipo de tarefa, complexidade, provedor escolhido e motivo.'
    ],
    taskTypes: ['conversation', 'strategy', 'technical', 'code', 'document', 'analysis', 'automation', 'research'] as AIRouterTaskType[]
  };
}
