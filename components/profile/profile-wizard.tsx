'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProfileEngineData } from '@/lib/profile/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';

const steps = [
  'Dados pessoais',
  'Profissional',
  'Comportamento',
  'Objetivos',
  'Rotina',
  'Ferramentas',
  'Conhecimentos',
  'Preferências IA'
];

const emptyProfile: ProfileEngineData = {
  personal: {},
  professional: {},
  behavioral: {},
  goals: { primary: [] },
  routine: { focusDays: [] },
  tools: { selected: [] },
  skills: { ia: 5, escrita: 5, gestao: 5, programacao: 5, engenharia: 5 },
  aiPreferences: {
    responseStyle: 'consultivo e objetivo',
    tone: 'profissional',
    useTables: true,
    useMarkdown: true,
    citeSources: true,
    generateDocuments: true,
    avoidEmojis: false
  }
};

const toolOptions = ['Gmail', 'Google Drive', 'Outlook', 'Teams', 'OneDrive', 'NotebookLM', 'GitHub', 'VS Code', 'Office', 'WhatsApp'];
const preferenceChecks: Array<[keyof ProfileEngineData['aiPreferences'], string]> = [
  ['useTables', 'Usar tabelas quando útil'],
  ['useMarkdown', 'Usar Markdown'],
  ['citeSources', 'Citar fontes'],
  ['generateDocuments', 'Gerar documentos'],
  ['avoidEmojis', 'Evitar emojis']
];
const goalOptions = ['Trabalho', 'Estudos', 'Projetos de IA', 'Documentos', 'Livros', 'Programação', 'Gestão', 'Pesquisa'];
const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function toggleArray(value: string, list: string[] = []) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
        active ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export function ProfileWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ProfileEngineData>(emptyProfile);
  const [completion, setCompletion] = useState(0);
  const [context, setContext] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'saved' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch('/api/profile', { cache: 'no-store' });
      const json = await response.json().catch(() => null);
      if (response.ok && json?.data) {
        setData({ ...emptyProfile, ...json.data });
        setCompletion(json.completionPercent ?? 0);
        setContext(json.userContext ?? null);
        setMessage(json.warning ?? null);
        setStatus('idle');
        return;
      }
      setStatus('error');
      setMessage(json?.error ?? 'Não foi possível carregar seu perfil.');
    }
    loadProfile();
  }, []);

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  function patch<K extends keyof ProfileEngineData>(section: K, value: Partial<ProfileEngineData[K]>) {
    setData((current) => ({ ...current, [section]: { ...(current[section] as object), ...value } }));
  }

  async function saveProfile() {
    setStatus('saving');
    setMessage(null);
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus('error');
      setMessage(json?.error ?? 'Erro ao salvar perfil.');
      return;
    }
    setCompletion(json.completionPercent ?? completion);
    setContext(json.userContext ?? null);
    setStatus('saved');
    setMessage('Perfil salvo. AURA/ARGUS já pode usar este contexto nas próximas respostas.');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="overflow-hidden">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Profile Engine</p>
            <h1 className="mt-2 text-3xl font-black text-white">Perfil inteligente</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Preencha uma vez. AURA e ARGUS usarão essas informações para ajustar tom, profundidade, prioridades e contexto.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-right">
            <p className="text-xs text-slate-400">Conclusão</p>
            <p className="text-2xl font-black text-cyan-200">{completion}%</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex justify-between text-xs text-slate-500">
            <span>Passo {step + 1} de {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map((name, index) => (
              <button
                key={name}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-full px-3 py-1 text-xs transition ${index === step ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                {index + 1}. {name}
              </button>
            ))}
          </div>
        </div>

        {status === 'loading' ? <p className="text-slate-400">Carregando perfil...</p> : null}

        {status !== 'loading' ? (
          <div className="space-y-6">
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo"><Input value={data.personal.fullName ?? ''} onChange={(e) => patch('personal', { fullName: e.target.value })} /></Field>
                <Field label="Nome preferido"><Input value={data.personal.preferredName ?? ''} onChange={(e) => patch('personal', { preferredName: e.target.value })} /></Field>
                <Field label="Cidade"><Input value={data.personal.city ?? ''} onChange={(e) => patch('personal', { city: e.target.value })} /></Field>
                <Field label="País"><Input value={data.personal.country ?? 'Brasil'} onChange={(e) => patch('personal', { country: e.target.value })} /></Field>
                <Field label="Idioma"><Input value={data.personal.language ?? 'pt-BR'} onChange={(e) => patch('personal', { language: e.target.value })} /></Field>
                <Field label="Fuso horário"><Input value={data.personal.timezone ?? 'America/Bahia'} onChange={(e) => patch('personal', { timezone: e.target.value })} /></Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cargo / função"><Input value={data.professional.title ?? ''} onChange={(e) => patch('professional', { title: e.target.value })} /></Field>
                <Field label="Empresa"><Input value={data.professional.company ?? ''} onChange={(e) => patch('professional', { company: e.target.value })} /></Field>
                <Field label="Área principal"><Input value={data.professional.area ?? ''} onChange={(e) => patch('professional', { area: e.target.value })} /></Field>
                <Field label="Formação"><Input value={data.professional.education ?? ''} onChange={(e) => patch('professional', { education: e.target.value })} /></Field>
                <Field label="LinkedIn"><Input value={data.professional.linkedin ?? ''} onChange={(e) => patch('professional', { linkedin: e.target.value })} /></Field>
                <Field label="GitHub"><Input value={data.professional.github ?? ''} onChange={(e) => patch('professional', { github: e.target.value })} /></Field>
                <Field label="Certificações"><Textarea value={data.professional.certifications ?? ''} onChange={(e) => patch('professional', { certifications: e.target.value })} className="md:col-span-2" /></Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="DISC predominante"><Input value={data.behavioral.disc ?? ''} onChange={(e) => patch('behavioral', { disc: e.target.value })} placeholder="D, I, S, C ou combinação" /></Field>
                <Field label="Estilo de comunicação"><Input value={data.behavioral.communicationStyle ?? ''} onChange={(e) => patch('behavioral', { communicationStyle: e.target.value })} placeholder="direto, consultivo, didático..." /></Field>
                <Field label="Nível de detalhe"><Input value={data.behavioral.detailLevel ?? ''} onChange={(e) => patch('behavioral', { detailLevel: e.target.value })} placeholder="resumido, equilibrado, profundo" /></Field>
                <Field label="Formalidade"><Input value={data.behavioral.formality ?? ''} onChange={(e) => patch('behavioral', { formality: e.target.value })} placeholder="informal, profissional, executivo" /></Field>
                <Field label="Aprendizagem"><Input value={data.behavioral.learningStyle ?? ''} onChange={(e) => patch('behavioral', { learningStyle: e.target.value })} placeholder="visual, prática, leitura..." /></Field>
                <Field label="Liderança"><Input value={data.behavioral.leadershipStyle ?? ''} onChange={(e) => patch('behavioral', { leadershipStyle: e.target.value })} /></Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((goal) => (
                    <Pill key={goal} active={(data.goals.primary ?? []).includes(goal)} onClick={() => patch('goals', { primary: toggleArray(goal, data.goals.primary) })}>{goal}</Pill>
                  ))}
                </div>
                <Field label="Projetos atuais"><Textarea value={data.goals.currentProjects ?? ''} onChange={(e) => patch('goals', { currentProjects: e.target.value })} rows={4} /></Field>
                <Field label="O que você espera da AURA/ARGUS?"><Textarea value={data.goals.desiredOutcomes ?? ''} onChange={(e) => patch('goals', { desiredOutcomes: e.target.value })} rows={5} /></Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Horário de trabalho"><Input value={data.routine.workHours ?? ''} onChange={(e) => patch('routine', { workHours: e.target.value })} /></Field>
                  <Field label="Horário de estudo"><Input value={data.routine.studyHours ?? ''} onChange={(e) => patch('routine', { studyHours: e.target.value })} /></Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <Pill key={day} active={(data.routine.focusDays ?? []).includes(day)} onClick={() => patch('routine', { focusDays: toggleArray(day, data.routine.focusDays) })}>{day}</Pill>
                  ))}
                </div>
                <Field label="Prioridades recorrentes"><Textarea value={data.routine.priorities ?? ''} onChange={(e) => patch('routine', { priorities: e.target.value })} rows={5} /></Field>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {toolOptions.map((tool) => (
                    <Pill key={tool} active={(data.tools.selected ?? []).includes(tool)} onClick={() => patch('tools', { selected: toggleArray(tool, data.tools.selected) })}>{tool}</Pill>
                  ))}
                </div>
                <Field label="Observações sobre ferramentas"><Textarea value={data.tools.notes ?? ''} onChange={(e) => patch('tools', { notes: e.target.value })} rows={4} /></Field>
              </div>
            )}

            {step === 6 && (
              <div className="grid gap-5 md:grid-cols-2">
                {Object.entries(data.skills).map(([skill, value]) => (
                  <Field key={skill} label={`${skill} (${value}/10)`}>
                    <input className="w-full accent-cyan-300" type="range" min="0" max="10" value={value} onChange={(e) => patch('skills', { [skill]: Number(e.target.value) })} />
                  </Field>
                ))}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Estilo de resposta"><Input value={data.aiPreferences.responseStyle ?? ''} onChange={(e) => patch('aiPreferences', { responseStyle: e.target.value })} /></Field>
                  <Field label="Tom"><Input value={data.aiPreferences.tone ?? ''} onChange={(e) => patch('aiPreferences', { tone: e.target.value })} /></Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {preferenceChecks.map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      {label}
                      <input
                        type="checkbox"
                        checked={Boolean(data.aiPreferences[key])}
                        onChange={(e) => patch('aiPreferences', { [key]: e.target.checked })}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {message ? (
              <div className={`rounded-2xl border p-3 text-sm ${status === 'error' ? 'border-rose-400/30 bg-rose-400/10 text-rose-100' : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'}`}>
                {message}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Voltar</Button>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={saveProfile} disabled={status === 'saving'}>{status === 'saving' ? 'Salvando...' : 'Salvar perfil'}</Button>
                <Button type="button" onClick={() => (step < steps.length - 1 ? setStep((s) => s + 1) : saveProfile())}>{step < steps.length - 1 ? 'Próximo' : 'Concluir'}</Button>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <aside className="space-y-5">
        <Card>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Contexto gerado</p>
          <h2 className="mt-2 text-xl font-black text-white">user_context.json</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Esse é o resumo que será enviado ao Prompt Builder para personalizar AURA e ARGUS.</p>
          <pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-cyan-100">
            {JSON.stringify(context ?? { status: 'preencha e salve o perfil' }, null, 2)}
          </pre>
        </Card>
      </aside>
    </div>
  );
}
