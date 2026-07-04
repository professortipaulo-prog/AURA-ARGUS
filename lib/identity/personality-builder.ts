import type { UserContext } from '@/lib/profile/types';
import type { IdentityInference, IdentitySignal } from './types';

function has(text: string | null | undefined, terms: string[]) {
  const value = (text ?? '').toLowerCase();
  return terms.some((term) => value.includes(term));
}

function levelName(level?: number | null) {
  if (!level) return 'não informado';
  if (level <= 1) return 'básico';
  if (level === 2) return 'intermediário';
  if (level === 3) return 'avançado';
  return 'especialista';
}

export function inferIdentityPatterns(context: UserContext): IdentityInference {
  const area = context.professional.area || '';
  const title = context.professional.title || '';
  const goals = [context.goals.currentProjects, context.goals.expectedSupport, context.goals.mainProject].join(' ');
  const prefersCode = Boolean(context.aiPreferences.directToCode || has(goals, ['software', 'sistema', 'código', 'programação', 'github', 'vercel']));
  const isEducation = has(`${area} ${title} ${goals}`, ['senai', 'educação', 'docente', 'curso', 'currículo', 'aula', 'aprendizagem']);
  const isManagement = has(`${title} ${goals}`, ['gestor', 'gestão', 'coordenação', 'projeto', 'planejamento', 'estratégia']);
  const isTechnical = has(`${area} ${title} ${goals}`, ['tecnologia', 'engenharia', 'software', 'ti', 'automação', 'dados', 'segurança']);

  return {
    professionalArchetype: isEducation
      ? 'educador técnico e gestor de desenvolvimento profissional'
      : isTechnical
        ? 'profissional técnico orientado a solução'
        : isManagement
          ? 'gestor orientado a execução'
          : 'profissional orientado a produtividade',
    communicationPattern: context.behavior.communicationStyle || context.aiPreferences.responseStyle || 'objetivo com contexto',
    decisionStyle: isManagement || context.aiPreferences.confirmCriticalActions ? 'decisão estruturada, com riscos, opções e próximos passos' : 'decisão objetiva com justificativa curta',
    autonomyLevel: context.aiPreferences.askBeforeActing ? 'baixa autonomia para ações externas; confirmar antes de agir' : 'autonomia assistida para organizar, propor e executar quando autorizado',
    deliveryPreference: prefersCode ? 'entregar implementação funcional quando o assunto for software' : 'entregar resposta organizada, aplicável e pronta para uso',
    riskAttention: context.aiPreferences.confirmCriticalActions || isTechnical ? 'validar riscos técnicos, segurança, escopo e impactos antes de mudanças críticas' : 'apontar riscos apenas quando forem relevantes'
  };
}

export function buildLearnedPreferences(context: UserContext): string[] {
  const prefs: string[] = [];
  if (context.aiPreferences.useMarkdown) prefs.push('usar Markdown limpo e estruturado');
  if (context.aiPreferences.useTables) prefs.push('usar tabelas quando facilitarem comparação ou organização');
  if (context.aiPreferences.citeSources) prefs.push('citar fontes quando houver fatos externos ou atuais');
  if (context.aiPreferences.generateDocuments) prefs.push('preparar entregáveis em formato de documento quando solicitado');
  if (context.aiPreferences.directToCode) prefs.push('ir direto ao código em demandas de software');
  if (context.aiPreferences.avoidEmojis) prefs.push('evitar emojis nas respostas finais');
  if (context.tools.selected.length) prefs.push(`considerar ferramentas declaradas: ${context.tools.selected.join(', ')}`);
  return prefs;
}

export function buildContextSignals(context: UserContext): IdentitySignal[] {
  return [
    {
      label: 'Identidade',
      value: context.identity.preferredName || context.identity.fullName || context.identity.email,
      strength: context.identity.fullName || context.identity.preferredName ? 'high' : 'medium',
      source: 'profile'
    },
    {
      label: 'Profissional',
      value: [context.professional.title, context.professional.company, context.professional.area].filter(Boolean).join(' · ') || 'não informado',
      strength: context.professional.title && context.professional.area ? 'high' : 'medium',
      source: 'profile'
    },
    {
      label: 'Preferência de resposta',
      value: [context.aiPreferences.responseStyle, context.aiPreferences.tone, context.behavior.detailLevel].filter(Boolean).join(' · ') || 'objetivo com contexto',
      strength: 'high',
      source: 'profile'
    },
    {
      label: 'Conhecimentos',
      value: `IA ${levelName(context.knowledge.ia?.level)} · Gestão ${levelName(context.knowledge.gestao?.level)} · Escrita ${levelName(context.knowledge.escrita?.level)} · Programação ${levelName(context.knowledge.programacao?.level)}`,
      strength: 'medium',
      source: 'profile'
    },
    {
      label: 'Ferramentas',
      value: context.tools.selected.length ? context.tools.selected.join(', ') : 'não informadas',
      strength: context.tools.selected.length ? 'high' : 'low',
      source: context.tools.selected.length ? 'profile' : 'default'
    }
  ];
}
