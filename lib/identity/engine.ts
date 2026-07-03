import { buildUserContext, calculateCompletion, mergeProfile } from '@/lib/profile/context';
import type { ProfileData, UserContext } from '@/lib/profile/types';

export type IdentitySignal = {
  label: string;
  value: string;
  strength: 'high' | 'medium' | 'low';
};

export type IdentityEngineResult = {
  context: UserContext;
  completion: number;
  summary: string;
  auraInstruction: string;
  argusInstruction: string;
  systemPrompt: string;
  signals: IdentitySignal[];
  gaps: string[];
};

function clean(value?: string | null): string {
  return (value ?? '').trim();
}

function join(items: Array<string | null | undefined>, fallback = 'não informado'): string {
  const valid = items.map(clean).filter(Boolean);
  return valid.length ? valid.join(' · ') : fallback;
}

function level(value?: number | null): string {
  if (value == null) return 'não informado';
  if (value <= 0) return 'não informado';
  if (value === 1) return 'básico';
  if (value === 2) return 'intermediário';
  if (value === 3) return 'avançado';
  return 'especialista';
}

function buildSummary(context: UserContext): string {
  const name = context.identity.preferredName || context.identity.fullName || context.identity.email;
  const professional = join([context.professional.title, context.professional.company, context.professional.area]);
  const goals = context.goals.categories.length ? context.goals.categories.join(', ') : 'objetivos ainda não detalhados';
  const tools = context.tools.selected.length ? context.tools.selected.slice(0, 8).join(', ') : 'ferramentas ainda não conectadas';
  return `${name} atua em ${professional}. Seus objetivos principais envolvem ${goals}. Usa ou pretende usar ${tools}. Prefere comunicação ${context.behavior.communicationStyle}, tom ${context.aiPreferences.tone} e nível de detalhe ${context.behavior.detailLevel}.`;
}

function buildSignals(context: UserContext): IdentitySignal[] {
  return [
    { label: 'Identidade', value: context.identity.preferredName || context.identity.email, strength: context.identity.fullName ? 'high' : 'medium' },
    { label: 'Atuação', value: join([context.professional.title, context.professional.company]), strength: context.professional.title ? 'high' : 'low' },
    { label: 'Área', value: context.professional.area || 'não informada', strength: context.professional.area ? 'high' : 'low' },
    { label: 'Comunicação', value: join([context.behavior.communicationStyle, context.behavior.detailLevel, context.aiPreferences.tone]), strength: 'high' },
    { label: 'Ferramentas', value: context.tools.selected.length ? context.tools.selected.join(', ') : 'não informadas', strength: context.tools.selected.length ? 'high' : 'low' },
    { label: 'Conhecimentos', value: `IA ${level(context.knowledge.ia?.level)} · Gestão ${level(context.knowledge.gestao?.level)} · Escrita ${level(context.knowledge.escrita?.level)} · Programação ${level(context.knowledge.programacao?.level)}`, strength: 'medium' }
  ];
}

function buildGaps(profile: ProfileData): string[] {
  const gaps: string[] = [];
  if (!profile.personal.preferredName && !profile.personal.fullName) gaps.push('Nome preferido');
  if (!profile.professional.title) gaps.push('Cargo/função');
  if (!profile.professional.company) gaps.push('Empresa/organização');
  if (!profile.goals.expectedSupport) gaps.push('O que espera da AURA/ARGUS');
  if (!profile.tools.selected.length) gaps.push('Ferramentas usadas');
  if (!profile.routine.activeDays.length) gaps.push('Rotina de trabalho/estudo');
  return gaps;
}

function buildAuraInstruction(context: UserContext): string {
  return [
    'Você é AURA, assistente universal de raciocínio e ação.',
    'Seu foco é clareza, organização, escrita, documentos, produtividade, planejamento e apoio profissional.',
    `Usuário: ${context.identity.preferredName || context.identity.email}.`,
    `Contexto profissional: ${join([context.professional.title, context.professional.company, context.professional.area])}.`,
    `Preferências: responder em estilo ${context.aiPreferences.responseStyle}, tom ${context.aiPreferences.tone}, comunicação ${context.behavior.communicationStyle}.`,
    context.aiPreferences.useTables ? 'Use tabelas quando ajudarem na compreensão.' : 'Evite tabelas salvo solicitação explícita.',
    context.aiPreferences.useMarkdown ? 'Use Markdown de forma limpa.' : 'Use texto simples quando possível.',
    context.aiPreferences.citeSources ? 'Quando usar informações externas ou atuais, indique fontes.' : '',
    context.aiPreferences.confirmCriticalActions ? 'Confirme antes de ações críticas, envio de mensagens ou alterações permanentes.' : '',
    context.goals.expectedSupport ? `Expectativa declarada: ${context.goals.expectedSupport}.` : ''
  ].filter(Boolean).join(' ');
}

function buildArgusInstruction(context: UserContext): string {
  return [
    'Você é ARGUS, agente de raciocínio, gestão, unificação e supervisão.',
    'Seu foco é análise técnica, segurança, automação, software, integrações, monitoramento e decisão operacional.',
    `Usuário: ${context.identity.preferredName || context.identity.email}.`,
    `Área principal: ${context.professional.area || 'não informada'}.`,
    `Conhecimentos: IA ${level(context.knowledge.ia?.level)}, programação ${level(context.knowledge.programacao?.level)}, gestão ${level(context.knowledge.gestao?.level)}, engenharia ${level(context.knowledge.engenharia?.level)}.`,
    `Ferramentas declaradas: ${context.tools.selected.length ? context.tools.selected.join(', ') : 'não informadas'}.`,
    context.aiPreferences.directToCode ? 'Quando o pedido envolver software, vá direto ao código funcional.' : 'Quando o pedido envolver software, explique apenas o necessário e entregue implementação prática.',
    context.aiPreferences.confirmCriticalActions ? 'Peça confirmação antes de executar ações externas ou irreversíveis.' : ''
  ].filter(Boolean).join(' ');
}

export function buildIdentityEngine(email: string, profileInput?: Partial<ProfileData> | null): IdentityEngineResult {
  const profile = mergeProfile(profileInput);
  const context = buildUserContext(email, profile);
  const completion = calculateCompletion(profile);
  const summary = buildSummary(context);
  const auraInstruction = buildAuraInstruction(context);
  const argusInstruction = buildArgusInstruction(context);
  const systemPrompt = [
    'IDENTIDADE PERMANENTE DO USUÁRIO:',
    summary,
    '',
    'INSTRUÇÃO PARA AURA:',
    auraInstruction,
    '',
    'INSTRUÇÃO PARA ARGUS:',
    argusInstruction
  ].join('\n');

  return {
    context,
    completion,
    summary,
    auraInstruction,
    argusInstruction,
    systemPrompt,
    signals: buildSignals(context),
    gaps: buildGaps(profile)
  };
}
