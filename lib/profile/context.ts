import type { KnowledgeLevel, ProfileData, UserContext } from './types';

export const emptyProfile: ProfileData = {
  personal: {
    fullName: '',
    preferredName: '',
    city: '',
    country: 'Brasil',
    language: 'pt-BR',
    timezone: 'America/Bahia'
  },
  professional: {
    title: '',
    company: '',
    department: '',
    area: '',
    education: '',
    experienceYears: '',
    workMode: '',
    linkedin: '',
    github: '',
    portfolio: '',
    certifications: ''
  },
  behavior: {
    communicationStyle: 'consultivo',
    detailLevel: 'equilibrado',
    formality: 'profissional',
    learningStyle: '',
    decisionSupport: 'explicar e recomendar',
    leadershipProfile: ''
  },
  goals: {
    categories: [],
    mainProject: '',
    currentProjects: '',
    expectedSupport: ''
  },
  routine: {
    workHours: '',
    studyHours: '',
    activeDays: [],
    recurringPriorities: ''
  },
  tools: {
    selected: [],
    notes: ''
  },
  knowledge: {
    ia: 2,
    escrita: 2,
    gestao: 2,
    programacao: 1,
    engenharia: 1
  },
  preferences: {
    responseStyle: 'objetivo com contexto',
    tone: 'profissional',
    askBeforeActing: false,
    confirmCriticalActions: true,
    useTables: true,
    useMarkdown: true,
    citeSources: true,
    generateDocuments: true,
    preferStepByStep: false,
    directToCode: false,
    avoidEmojis: false
  }
};

export function mergeProfile(profile?: Partial<ProfileData> | null): ProfileData {
  if (!profile) return emptyProfile;
  return {
    personal: { ...emptyProfile.personal, ...(profile.personal ?? {}) },
    professional: { ...emptyProfile.professional, ...(profile.professional ?? {}) },
    behavior: { ...emptyProfile.behavior, ...(profile.behavior ?? {}) },
    goals: { ...emptyProfile.goals, ...(profile.goals ?? {}) },
    routine: { ...emptyProfile.routine, ...(profile.routine ?? {}) },
    tools: { ...emptyProfile.tools, ...(profile.tools ?? {}) },
    knowledge: { ...emptyProfile.knowledge, ...(profile.knowledge ?? {}) },
    preferences: { ...emptyProfile.preferences, ...(profile.preferences ?? {}) }
  };
}

export function knowledgeLabel(level: KnowledgeLevel): string {
  return ['Nunca utilizei', 'Básico', 'Intermediário', 'Avançado', 'Especialista'][level] ?? 'Intermediário';
}

export function calculateCompletion(profile: ProfileData): number {
  const checks: boolean[] = [
    !!profile.personal.fullName,
    !!profile.personal.preferredName,
    !!profile.personal.city,
    !!profile.professional.title,
    !!profile.professional.company,
    !!profile.professional.area,
    !!profile.professional.education,
    !!profile.behavior.communicationStyle,
    !!profile.behavior.detailLevel,
    !!profile.behavior.decisionSupport,
    profile.goals.categories.length > 0,
    !!profile.goals.mainProject,
    !!profile.goals.expectedSupport,
    !!profile.routine.workHours,
    profile.routine.activeDays.length > 0,
    profile.tools.selected.length > 0,
    Object.values(profile.knowledge).some((v) => Number(v) >= 2),
    !!profile.preferences.responseStyle,
    !!profile.preferences.tone,
    profile.preferences.confirmCriticalActions
  ];
  return Math.max(5, Math.round((checks.filter(Boolean).length / checks.length) * 100));
}

export function buildUserContext(email: string, profile: ProfileData): UserContext {
  const preferredName = profile.personal.preferredName || profile.personal.fullName || email;
  const location = [profile.personal.city, profile.personal.country].filter(Boolean).join(', ') || null;
  const knowledge = Object.fromEntries(
    Object.entries(profile.knowledge).map(([key, value]) => [key, { level: value, label: knowledgeLabel(value as KnowledgeLevel) }])
  ) as UserContext['knowledge'];

  const promptInstruction = [
    `Você está auxiliando ${preferredName}.`,
    profile.professional.title ? `Atuação profissional: ${profile.professional.title}.` : '',
    profile.professional.company ? `Organização/empresa: ${profile.professional.company}.` : '',
    profile.professional.area ? `Área principal: ${profile.professional.area}.` : '',
    `Comunicação preferida: ${profile.behavior.communicationStyle}, tom ${profile.preferences.tone}, nível ${profile.behavior.detailLevel}.`,
    profile.preferences.useMarkdown ? 'Use Markdown quando melhorar a clareza.' : 'Evite Markdown quando não for necessário.',
    profile.preferences.useTables ? 'Use tabelas quando forem úteis.' : 'Evite tabelas salvo pedido explícito.',
    profile.preferences.citeSources ? 'Cite fontes quando usar informação externa ou atual.' : '',
    profile.preferences.confirmCriticalActions ? 'Confirme antes de executar ações críticas, envios ou alterações permanentes.' : '',
    profile.preferences.directToCode ? 'Quando o pedido envolver software, vá direto ao código funcional.' : '',
    profile.goals.expectedSupport ? `O usuário espera da AURA/ARGUS: ${profile.goals.expectedSupport}` : ''
  ].filter(Boolean).join(' ');

  return {
    identity: {
      email,
      fullName: profile.personal.fullName,
      preferredName,
      location,
      language: profile.personal.language,
      timezone: profile.personal.timezone
    },
    professional: {
      title: profile.professional.title,
      company: profile.professional.company,
      department: profile.professional.department,
      area: profile.professional.area,
      education: profile.professional.education,
      experienceYears: profile.professional.experienceYears,
      workMode: profile.professional.workMode,
      linkedin: profile.professional.linkedin || null,
      github: profile.professional.github || null,
      portfolio: profile.professional.portfolio || null
    },
    behavior: profile.behavior,
    goals: profile.goals,
    routine: profile.routine,
    tools: profile.tools,
    knowledge,
    aiPreferences: profile.preferences,
    promptInstruction
  };
}
