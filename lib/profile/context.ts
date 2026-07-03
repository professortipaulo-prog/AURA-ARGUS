import type { ProfileEngineData } from './types';

const requiredPaths: Array<[keyof ProfileEngineData, string]> = [
  ['personal', 'fullName'],
  ['personal', 'preferredName'],
  ['personal', 'city'],
  ['professional', 'title'],
  ['professional', 'area'],
  ['behavioral', 'communicationStyle'],
  ['goals', 'desiredOutcomes'],
  ['routine', 'priorities'],
  ['tools', 'selected'],
  ['aiPreferences', 'responseStyle']
];

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'boolean') return true;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return false;
}

function getNested(data: ProfileEngineData, section: keyof ProfileEngineData, field: string) {
  const value = data[section] as Record<string, unknown> | undefined;
  return value?.[field];
}

export function calculateProfileCompletion(data: ProfileEngineData): number {
  const completed = requiredPaths.filter(([section, field]) => hasValue(getNested(data, section, field))).length;
  return Math.round((completed / requiredPaths.length) * 100);
}

export function buildUserContext(data: ProfileEngineData, email: string) {
  return {
    identity: {
      email,
      fullName: data.personal.fullName ?? null,
      preferredName: data.personal.preferredName ?? data.personal.fullName ?? null,
      location: [data.personal.city, data.personal.country].filter(Boolean).join(', ') || null,
      language: data.personal.language ?? 'pt-BR',
      timezone: data.personal.timezone ?? 'America/Bahia'
    },
    professional: {
      title: data.professional.title ?? null,
      company: data.professional.company ?? null,
      area: data.professional.area ?? null,
      education: data.professional.education ?? null,
      linkedin: data.professional.linkedin ?? null,
      github: data.professional.github ?? null
    },
    behavior: {
      disc: data.behavioral.disc ?? null,
      communicationStyle: data.behavioral.communicationStyle ?? 'consultivo',
      detailLevel: data.behavioral.detailLevel ?? 'equilibrado',
      formality: data.behavioral.formality ?? 'profissional',
      learningStyle: data.behavioral.learningStyle ?? null
    },
    goals: data.goals,
    routine: data.routine,
    tools: data.tools.selected ?? [],
    skills: data.skills,
    aiPreferences: data.aiPreferences,
    systemInstruction: [
      `Voce esta apoiando ${data.personal.preferredName || data.personal.fullName || email}.`,
      data.professional.title ? `Perfil profissional: ${data.professional.title}.` : null,
      data.professional.area ? `Area principal: ${data.professional.area}.` : null,
      data.aiPreferences.responseStyle ? `Estilo de resposta preferido: ${data.aiPreferences.responseStyle}.` : null,
      data.behavioral.detailLevel ? `Nivel de detalhe: ${data.behavioral.detailLevel}.` : null,
      data.aiPreferences.useTables ? 'Use tabelas quando forem uteis.' : null,
      data.aiPreferences.useMarkdown !== false ? 'Use Markdown claro e organizado.' : null,
      data.aiPreferences.citeSources ? 'Cite fontes quando usar informacoes externas.' : null,
      data.aiPreferences.avoidEmojis ? 'Evite emojis.' : null
    ].filter(Boolean).join(' ')
  };
}

export const emptyProfile: ProfileEngineData = {
  personal: {},
  professional: {},
  behavioral: {},
  goals: { primary: [] },
  routine: { focusDays: [] },
  tools: { selected: [] },
  skills: {
    ia: 5,
    escrita: 5,
    gestao: 5,
    programacao: 5,
    engenharia: 5
  },
  aiPreferences: {
    responseStyle: 'consultivo e objetivo',
    useTables: true,
    useMarkdown: true,
    citeSources: true,
    generateDocuments: true,
    avoidEmojis: false,
    tone: 'profissional'
  }
};
