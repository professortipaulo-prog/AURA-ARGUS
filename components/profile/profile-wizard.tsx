'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildUserContext, calculateCompletion, emptyProfile, knowledgeLabel, mergeProfile } from '@/lib/profile/context';
import type { KnowledgeLevel, ProfileData, UserContext } from '@/lib/profile/types';

const steps = ['Dados pessoais', 'Profissional', 'Comportamento', 'Objetivos', 'Rotina', 'Ferramentas', 'Conhecimentos', 'Preferências IA'];
const goalOptions = ['Trabalho', 'Estudos', 'Projetos de IA', 'Documentos', 'Livros', 'Programação', 'Gestão', 'Pesquisa'];
const dayOptions = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const toolOptions = ['Gmail', 'Google Drive', 'Outlook', 'Teams', 'OneDrive', 'NotebookLM', 'GitHub', 'VS Code', 'Cursor', 'ChatGPT', 'Claude', 'Gemini', 'Office', 'WhatsApp'];
const knowledgeKeys: Array<[keyof ProfileData['knowledge'], string]> = [
  ['ia', 'IA'],
  ['escrita', 'Escrita'],
  ['gestao', 'Gestão'],
  ['programacao', 'Programação'],
  ['engenharia', 'Engenharia']
];

type Props = {
  email: string;
  initialProfile?: Partial<ProfileData> | null;
  initialCompletion?: number;
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block space-y-3">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-300/80" />
    </label>
  );
}

function Area({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block space-y-3 md:col-span-2">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-300/80" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block space-y-3">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-300/80">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${active ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/[.05] text-slate-400 hover:text-white'}`}>
      {children}
    </button>
  );
}

function SummaryPanel({ context, completion }: { context: UserContext; completion: number }) {
  return (
    <aside className="rounded-3xl border border-cyan-300/15 bg-slate-950/60 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Contexto gerado</p>
      <h2 className="mt-4 text-2xl font-black text-white">Resumo inteligente</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Prévia do contexto que será enviado ao Prompt Builder.</p>
      <div className="mt-6 space-y-4 text-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <p className="font-semibold text-cyan-100">Identidade</p>
          <p className="mt-2 text-slate-400">{context.identity.preferredName || context.identity.email}</p>
          <p className="text-slate-500">{context.identity.location ?? 'Localização não informada'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <p className="font-semibold text-cyan-100">Profissional</p>
          <p className="mt-2 text-slate-400">{context.professional.title || 'Cargo não informado'}</p>
          <p className="text-slate-500">{context.professional.company || 'Empresa não informada'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <p className="font-semibold text-cyan-100">Preferências da IA</p>
          <p className="mt-2 text-slate-400">{context.behavior.communicationStyle} · {context.behavior.detailLevel} · {context.aiPreferences.tone}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <p className="font-semibold text-cyan-100">Ferramentas</p>
          <p className="mt-2 text-slate-400">{context.tools.selected.length ? context.tools.selected.join(', ') : 'Nenhuma ferramenta selecionada'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <p className="font-semibold text-cyan-100">Conclusão</p>
          <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: `${completion}%` }} /></div>
          <p className="mt-2 text-right text-cyan-100">{completion}%</p>
        </div>
      </div>
    </aside>
  );
}

export function ProfileWizard({ email, initialProfile, initialCompletion = 0 }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>(() => mergeProfile(initialProfile));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => Math.max(initialCompletion, calculateCompletion(profile)), [initialCompletion, profile]);
  const context = useMemo(() => buildUserContext(email, profile), [email, profile]);

  useEffect(() => {
    setSaved(false);
  }, [profile]);

  function update<K extends keyof ProfileData>(section: K, value: Partial<ProfileData[K]>) {
    setProfile((current) => ({ ...current, [section]: { ...current[section], ...value } }));
  }

  async function saveProfile() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'Erro ao salvar perfil.');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  }

  function renderStep() {
    if (step === 0) return (
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome completo" value={profile.personal.fullName} onChange={(v) => update('personal', { fullName: v })} />
        <Field label="Nome preferido" value={profile.personal.preferredName} onChange={(v) => update('personal', { preferredName: v })} />
        <Field label="Cidade" value={profile.personal.city} onChange={(v) => update('personal', { city: v })} />
        <Field label="País" value={profile.personal.country} onChange={(v) => update('personal', { country: v })} />
        <Field label="Idioma" value={profile.personal.language} onChange={(v) => update('personal', { language: v })} />
        <Field label="Fuso horário" value={profile.personal.timezone} onChange={(v) => update('personal', { timezone: v })} />
      </div>
    );

    if (step === 1) return (
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Cargo / função" value={profile.professional.title} onChange={(v) => update('professional', { title: v })} />
        <Field label="Empresa" value={profile.professional.company} onChange={(v) => update('professional', { company: v })} />
        <Field label="Departamento" value={profile.professional.department} onChange={(v) => update('professional', { department: v })} />
        <Field label="Área principal" value={profile.professional.area} onChange={(v) => update('professional', { area: v })} />
        <Field label="Formação" value={profile.professional.education} onChange={(v) => update('professional', { education: v })} />
        <Select label="Tipo de atuação" value={profile.professional.workMode} onChange={(v) => update('professional', { workMode: v })} options={['', 'Gestor', 'Professor', 'Consultor', 'Empresário', 'Autônomo', 'Servidor', 'Estudante', 'Técnico', 'Especialista']} />
        <Field label="Anos de experiência" value={profile.professional.experienceYears} onChange={(v) => update('professional', { experienceYears: v })} />
        <Field label="LinkedIn" value={profile.professional.linkedin} onChange={(v) => update('professional', { linkedin: v })} />
        <Field label="GitHub" value={profile.professional.github} onChange={(v) => update('professional', { github: v })} />
        <Field label="Portfólio" value={profile.professional.portfolio} onChange={(v) => update('professional', { portfolio: v })} />
        <Area label="Certificações" value={profile.professional.certifications} onChange={(v) => update('professional', { certifications: v })} rows={3} />
      </div>
    );

    if (step === 2) return (
      <div className="grid gap-5 md:grid-cols-2">
        <Select label="Estilo de comunicação" value={profile.behavior.communicationStyle} onChange={(v) => update('behavior', { communicationStyle: v })} options={['consultivo', 'direto', 'didático', 'técnico', 'executivo', 'criativo']} />
        <Select label="Nível de detalhe" value={profile.behavior.detailLevel} onChange={(v) => update('behavior', { detailLevel: v })} options={['resumido', 'equilibrado', 'profundo', 'passo a passo']} />
        <Select label="Formalidade" value={profile.behavior.formality} onChange={(v) => update('behavior', { formality: v })} options={['casual', 'profissional', 'formal', 'institucional']} />
        <Select label="Apoio à decisão" value={profile.behavior.decisionSupport} onChange={(v) => update('behavior', { decisionSupport: v })} options={['apenas informar', 'explicar e recomendar', 'comparar opções', 'decidir com justificativa']} />
        <Field label="Estilo de aprendizagem" value={profile.behavior.learningStyle} onChange={(v) => update('behavior', { learningStyle: v })} placeholder="visual, prático, leitura, exemplos..." />
        <Field label="Perfil de liderança" value={profile.behavior.leadershipProfile} onChange={(v) => update('behavior', { leadershipProfile: v })} placeholder="gestor, técnico, educador, mentor..." />
        <div className="md:col-span-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm text-slate-300">
          O DISC foi removido do formulário. Se quiser usar um teste externo no futuro, ele entrará como integração opcional, não como campo obrigatório.
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">{goalOptions.map((g) => <ChoiceButton key={g} active={profile.goals.categories.includes(g)} onClick={() => update('goals', { categories: toggle(profile.goals.categories, g) })}>{g}</ChoiceButton>)}</div>
        <Field label="Projeto principal" value={profile.goals.mainProject} onChange={(v) => update('goals', { mainProject: v })} />
        <Area label="Projetos atuais" value={profile.goals.currentProjects} onChange={(v) => update('goals', { currentProjects: v })} rows={4} />
        <Area label="O que você espera da AURA/ARGUS?" value={profile.goals.expectedSupport} onChange={(v) => update('goals', { expectedSupport: v })} rows={4} />
      </div>
    );

    if (step === 4) return (
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Horário de trabalho" value={profile.routine.workHours} onChange={(v) => update('routine', { workHours: v })} />
          <Field label="Horário de estudo" value={profile.routine.studyHours} onChange={(v) => update('routine', { studyHours: v })} />
        </div>
        <div className="flex flex-wrap gap-2">{dayOptions.map((d) => <ChoiceButton key={d} active={profile.routine.activeDays.includes(d)} onClick={() => update('routine', { activeDays: toggle(profile.routine.activeDays, d) })}>{d}</ChoiceButton>)}</div>
        <Area label="Prioridades recorrentes" value={profile.routine.recurringPriorities} onChange={(v) => update('routine', { recurringPriorities: v })} rows={4} />
      </div>
    );

    if (step === 5) return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{toolOptions.map((t) => <ChoiceButton key={t} active={profile.tools.selected.includes(t)} onClick={() => update('tools', { selected: toggle(profile.tools.selected, t) })}>{t}</ChoiceButton>)}</div>
        <Area label="Observações sobre ferramentas" value={profile.tools.notes} onChange={(v) => update('tools', { notes: v })} rows={4} />
      </div>
    );

    if (step === 6) return (
      <div className="grid gap-8 md:grid-cols-2">
        {knowledgeKeys.map(([key, label]) => {
          const value = profile.knowledge[key] as KnowledgeLevel;
          return (
            <label key={String(key)} className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label} · {knowledgeLabel(value)}</span>
              <input type="range" min="0" max="4" value={value} onChange={(e) => update('knowledge', { [key]: Number(e.target.value) as KnowledgeLevel })} className="w-full accent-cyan-300" />
            </label>
          );
        })}
      </div>
    );

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Select label="Estilo de resposta" value={profile.preferences.responseStyle} onChange={(v) => update('preferences', { responseStyle: v })} options={['direto', 'objetivo com contexto', 'detalhado', 'passo a passo', 'consultivo e objetivo']} />
        <Select label="Tom" value={profile.preferences.tone} onChange={(v) => update('preferences', { tone: v })} options={['profissional', 'formal', 'didático', 'executivo', 'criativo']} />
        {[
          ['askBeforeActing', 'Perguntar antes de agir'],
          ['confirmCriticalActions', 'Confirmar ações críticas'],
          ['useTables', 'Usar tabelas quando útil'],
          ['useMarkdown', 'Usar Markdown'],
          ['citeSources', 'Citar fontes'],
          ['generateDocuments', 'Gerar documentos'],
          ['preferStepByStep', 'Explicar passo a passo'],
          ['directToCode', 'Ir direto ao código quando for software'],
          ['avoidEmojis', 'Evitar emojis']
        ].map(([rawKey, label]) => {
          const key = rawKey as keyof ProfileData['preferences'];
          return (
          <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.06] px-4 py-4 text-sm text-slate-200">
            {label}
            <input type="checkbox" checked={Boolean(profile.preferences[key])} onChange={(e) => update('preferences', { [key]: e.target.checked } as Partial<ProfileData['preferences']>)} />
          </label>
        );
        })}
      </div>
    );
  }

  return (
    <section className="grid gap-6 p-5 xl:grid-cols-[1fr_380px]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-7 shadow-2xl shadow-cyan-950/10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-cyan-300">Profile Engine</p>
            <h1 className="mt-4 text-3xl font-black text-white">Perfil inteligente</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Preencha uma vez. AURA e ARGUS usarão essas informações para ajustar tom, profundidade, prioridades e contexto.</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-7 py-4 text-center">
            <p className="text-xs text-slate-400">Conclusão</p>
            <p className="text-3xl font-black text-cyan-100">{completion}%</p>
          </div>
        </div>
        <div className="mt-10">
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Passo {step + 1} de {steps.length}</span><span>{steps[step]}</span></div>
          <div className="mt-3 h-2 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          <div className="mt-4 flex flex-wrap gap-2">{steps.map((s, index) => <button key={s} type="button" onClick={() => setStep(index)} className={`rounded-full px-3 py-1.5 text-xs transition ${index === step ? 'bg-indigo-500 text-white' : 'bg-white/[.05] text-slate-500 hover:text-white'}`}>{index + 1}. {s}</button>)}</div>
        </div>
        <div className="mt-10">{renderStep()}</div>
        {saved ? <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">Perfil salvo com sucesso.</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</div> : null}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-2xl border border-white/10 bg-white/[.08] px-6 py-3 text-sm font-bold text-white disabled:opacity-40">Voltar</button>
          <div className="flex gap-3">
            <button type="button" onClick={saveProfile} disabled={saving} className="rounded-2xl border border-white/10 bg-white/[.12] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar perfil'}</button>
            {step < steps.length - 1 ? <button type="button" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">Próximo</button> : <button type="button" onClick={saveProfile} disabled={saving} className="rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">Concluir</button>}
          </div>
        </div>
      </div>
      <SummaryPanel context={context} completion={completion} />
    </section>
  );
}
