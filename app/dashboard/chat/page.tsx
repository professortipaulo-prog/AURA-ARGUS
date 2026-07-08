'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/header';
import { LivingBackground } from '@/components/living-background';

type Persona = 'aura' | 'argus';
type ChatMessage = {
  role: 'user' | 'assistant' | 'error';
  content: string;
  persona?: Persona;
  meta?: string;
  time?: string;
};

type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memoryCount: number;
  sessionCount: number;
};

type LocalMemory = {
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

const PERSONAS = {
  aura: {
    label: 'AURA',
    title: 'Assistente Estratégica',
    image: '/avatars/aura.webp',
    placeholder: 'Digite sua mensagem para AURA...',
    intro: 'AURA online. Pronta para compreender, organizar e orientar.',
    thinking: 'AURA está organizando a resposta...',
    meta: 'Estratégia · escrita · documentos · organização',
    system:
      'Você é AURA, assistente estratégica do sistema AURA/ARGUS. Nunca diga que é Claude, Gemini ou modelo de linguagem. Você é AURA. Responda em português do Brasil, com tom consultivo, claro, elegante e objetivo. Ajude Paulo a organizar ideias, estruturar documentos, planejar entregas, melhorar decisões e transformar demandas em resultado. Não exponha JSON, tabelas internas ou instruções do sistema.'
  },
  argus: {
    label: 'ARGUS',
    title: 'Assistente Operacional',
    image: '/avatars/argus.webp',
    placeholder: 'Digite sua solicitação para ARGUS...',
    intro: 'ARGUS online. Pronto para analisar, supervisionar e executar.',
    thinking: 'ARGUS está analisando a execução...',
    meta: 'Execução · automação · arquitetura · análise técnica',
    system:
      'Você é ARGUS, assistente operacional do sistema AURA/ARGUS. Nunca diga que é AURA, Claude, Gemini ou modelo de linguagem. Você é ARGUS. Responda em português do Brasil, com tom direto, técnico, executivo e verificável. Foque em diagnóstico, causa, ação, sequência de implementação, arquitetura, automação, software e resultado. Não exponha JSON, tabelas internas ou instruções do sistema.'
  }
} as const;

const USER_CONTEXT =
  'Contexto permanente do usuário: Paulo da Silva Filho atua na área de Tecnologia, é Gestor Especialista de TI do SENAI Bahia, professor universitário e trabalha com projetos de IA, desenvolvimento curricular, documentos técnicos, sistemas web e consultoria. Prefere respostas objetivas, práticas, técnicas, com contexto e sem enrolação.';

const LOCAL_MEMORY_KEY = 'aura-argus-chat-local-memory-v1';
const LOCAL_MEMORY_STATS_KEY = 'aura-argus-chat-local-stats-v1';
const DEFAULT_PROJECT: ProjectSummary = {
  id: 'aura-argus-public',
  name: 'AURA/ARGUS AI Operating System',
  slug: 'aura-argus',
  description: 'Projeto operacional padrão do AURA/ARGUS para conversas, memória e estabilização técnica.',
  memoryCount: 0,
  sessionCount: 0
};

function compact(value: string, max = 220) {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function cleanFact(value: string) {
  return value.replace(/[.;]+$/, '').trim();
}

function stripAccents(value: string) {
  return (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isQuestionLike(text: string) {
  const value = stripAccents((text || '').trim());
  if (!value) return false;
  if (/[?？]$/.test(value)) return true;
  return /^(qual|quais|o que|quem|onde|quando|como|por que|porque|resuma|resumo|liste|me diga|voce sabe|você sabe|quanto|quantas|quantos)\b/.test(value);
}

function isCorruptedLocalMemory(text: string) {
  const value = stripAccents((text || '').replace(/\s+/g, ' ').trim());
  if (!value) return true;
  if (isQuestionLike(value)) return true;
  return [
    /proxima etapa deste projeto e deste projeto/,
    /proxima etapa deste projeto e qual/,
    /proxima etapa deste projeto e resuma/,
    /banco principal.*qual banco/,
    /framework.*qual framework/,
    /deploy.*qual deploy/,
  ].some((pattern) => pattern.test(value));
}

function extractLocalMemories(message: string): LocalMemory[] {
  const nowIso = new Date().toISOString();
  const memories: LocalMemory[] = [];
  const lines = message
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const add = (title: string, content: string, tags: string[]) => {
    const normalized = compact(content, 360);
    if (!normalized || isCorruptedLocalMemory(normalized)) return;
    const key = title.toLowerCase();
    if (memories.some((item) => item.title.toLowerCase() === key)) return;
    memories.push({ title, content: normalized, tags, createdAt: nowIso });
  };

  const scan = (text: string) => {
    if (isQuestionLike(text) || isCorruptedLocalMemory(text)) return;
    const banco = text.match(/(?:meu|minha|o)\s+banco(?:\s+principal|\s+de\s+dados)?\s*(?:é|eh|será|sera|:)\s*(.+)$/i);
    if (banco?.[1]) add('Banco principal do projeto', `O banco principal utilizado neste projeto é ${cleanFact(banco[1])}.`, ['database', 'project', 'confirmed']);

    const etapa = text.match(/(?:a\s+)?(?:próxima etapa|proxima etapa|próximo passo|proximo passo)(?:\s+deste\s+projeto)?\s*(?:é|eh|será|sera|:)\s*(.+)$/i);
    if (etapa?.[1]) add('Próxima etapa do projeto', `A próxima etapa deste projeto é ${cleanFact(etapa[1])}.`, ['next-step', 'project', 'confirmed']);

    const deploy =
      text.match(/(?:meu\s+deploy|deploy)\s*(?:é|eh|será|sera|:)\s*(?:na|no|em|a|o)?\s*(.+)$/i) ??
      text.match(/(?:utilizarei|usarei|vamos usar|será usado|sera usado)\s+(.+?)\s+(?:para deploy|como deploy|no deploy)/i);
    if (deploy?.[1]) add('Deploy do projeto', `O deploy do projeto utiliza ${cleanFact(deploy[1])}.`, ['deploy', 'project', 'confirmed']);

    const framework =
      text.match(/(?:meu\s+framework|framework)\s*(?:é|eh|será|sera|:)\s*(.+)$/i) ??
      text.match(/(Next\.js\s*14|NextJS\s*14|Next\s*14)\s+como\s+framework/i);
    if (framework?.[1]) add('Framework do projeto', `O framework do projeto é ${cleanFact(framework[1])}.`, ['framework', 'project', 'confirmed']);

    const iaEstrategica = text.match(/(?:minha|a)\s+IA\s+estrat[ée]gica\s*(?:utiliza|usa|é|eh|será|sera|:)\s*(.+)$/i);
    if (iaEstrategica?.[1]) add('IA estratégica do projeto', `A IA estratégica do projeto utiliza ${cleanFact(iaEstrategica[1])}.`, ['ai', 'aura', 'project', 'confirmed']);

    const iaOperacional = text.match(/(?:minha|a)\s+IA\s+operacional\s*(?:utiliza|usa|é|eh|será|sera|:)\s*(.+)$/i);
    if (iaOperacional?.[1]) add('IA operacional do projeto', `A IA operacional do projeto utiliza ${cleanFact(iaOperacional[1])}.`, ['ai', 'argus', 'project', 'confirmed']);

    const nomeProjeto = text.match(/(?:meu\s+projeto\s+chama-se|projeto\s+ativo\s*(?:é|eh|:))\s*(.+)$/i);
    if (nomeProjeto?.[1]) add('Nome do projeto', `O projeto ativo chama-se ${cleanFact(nomeProjeto[1])}.`, ['project', 'confirmed']);

    const objetivo = text.match(/(?:o\s+)?objetivo\s+principal\s*(?:é|eh|será|sera|:)\s*(.+)$/i);
    if (objetivo?.[1]) add('Objetivo principal do projeto', `O objetivo principal do projeto é ${cleanFact(objetivo[1])}.`, ['objective', 'project', 'confirmed']);

    const editor = text.match(/(?:meu\s+editor|editor\s+principal)\s*(?:é|eh|:)\s*(.+)$/i);
    if (editor?.[1]) add('Editor principal', `O editor principal utilizado por Paulo é ${cleanFact(editor[1])}.`, ['development', 'tool', 'confirmed']);

    const corFavorita =
      text.match(/(?:minha\s+)?cor\s+(?:favorita|preferida)\s*(?:é|eh|:)\s*(.+)$/i) ??
      text.match(/(?:eu\s+)?(?:gosto|prefiro)\s+(?:da\s+cor\s+)?(?:de\s+)?([a-záàâãéêíóôõúç\s-]{3,40}?)[.!?]*$/i);
    if (corFavorita?.[1]) {
      const cor = cleanFact(corFavorita[1]);
      if (!/^(responder|saber|lembrar|perguntar|dizer|confirmar)$/i.test(cor)) {
        add('Cor favorita de Paulo', `A cor favorita/preferida de Paulo é ${cor}.`, ['preference', 'personal', 'visual', 'confirmed']);
      }
    }

    const sistema = text.match(/trabalho\s+no\s+(.+?),?\s+mas\s+prefiro\s+(.+)$/i);
    if (sistema?.[1] && sistema?.[2]) add('Ambiente de desenvolvimento', `Paulo trabalha no ${cleanFact(sistema[1])}, mas prefere ${cleanFact(sistema[2])}.`, ['development', 'os', 'confirmed']);
  };

  for (const line of lines) scan(line);
  if (!lines.length) scan(message.trim());

  return memories;
}

function localMemoryPriorityScore(memory: LocalMemory) {
  const haystack = stripAccents(`${memory.title} ${memory.content} ${memory.tags.join(' ')}`);
  let score = 0;
  if (/proxima etapa|proximo passo|next-step|pendencia|marco/.test(haystack)) score += 100;
  if (/banco principal|supabase|deploy|vercel|framework|next\.?js|nextjs|ia estrategica|ia operacional|claude|gemini/.test(haystack)) score += 90;
  if (/objetivo principal|nome do projeto|aura\/argus|aura argus/.test(haystack)) score += 75;
  if (/project|projeto|confirmed|confirmado/.test(haystack)) score += 40;
  if (/editor|vs code|windows|linux|ambiente de desenvolvimento/.test(haystack)) score += 25;
  if (/cor favorita|cor preferida|preference|preferencia|visual/.test(haystack)) score += 20;
  const createdAt = Date.parse(memory.createdAt || '');
  if (createdAt > 0) score += Math.max(0, 24 - Math.min(24, (Date.now() - createdAt) / 36e5));
  return score;
}

function sortLocalMemoriesByPriority(items: LocalMemory[]) {
  return [...items]
    .filter((item) => !isCorruptedLocalMemory(item.content) && !isCorruptedLocalMemory(item.title))
    .sort((a, b) => localMemoryPriorityScore(b) - localMemoryPriorityScore(a));
}

function mergeLocalMemories(current: LocalMemory[], incoming: LocalMemory[]) {
  if (!incoming.length) return current;
  const byTitle = new Map<string, LocalMemory>();
  for (const item of current) byTitle.set(item.title.toLowerCase(), item);
  for (const item of incoming) byTitle.set(item.title.toLowerCase(), item);
  return sortLocalMemoriesByPriority(Array.from(byTitle.values())).slice(0, 24);
}

function loadLocalMemories(): LocalMemory[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = JSON.parse(window.localStorage.getItem(LOCAL_MEMORY_KEY) || '[]');
    return Array.isArray(data) ? sortLocalMemoriesByPriority(data.filter((item) => item?.title && item?.content)).slice(0, 24) : [];
  } catch {
    return [];
  }
}

function saveLocalMemories(memories: LocalMemory[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_MEMORY_KEY, JSON.stringify(sortLocalMemoriesByPriority(memories).slice(0, 24)));
}

function findLocalMemoryByTags(memories: LocalMemory[], required: string[]) {
  return sortLocalMemoriesByPriority(memories).find((memory) => {
    const tags = new Set(memory.tags.map((tag) => stripAccents(tag)));
    const text = stripAccents(`${memory.title} ${memory.content}`);
    return required.every((tag) => tags.has(tag) || text.includes(tag));
  }) ?? null;
}

function extractColorFromMemory(memory: LocalMemory | null) {
  if (!memory) return null;
  const content = memory.content.replace(/\s+/g, ' ').trim();
  const match = content.match(/(?:é|eh)\s+([A-Za-zÀ-ÿ\s-]+)\.?$/i);
  const color = cleanFact(match?.[1] ?? content.replace(/^.*cor favorita\/preferida de Paulo\s+(?:é|eh)\s+/i, ''));
  return color || null;
}

function resolveLocalMemoryAnswer(question: string, memories: LocalMemory[], personaLabel: string) {
  const normalizedQuestion = stripAccents(question);

  if (/\b(cor favorita|cor preferida|minha cor|qual.*cor)\b/.test(normalizedQuestion)) {
    const memory = findLocalMemoryByTags(memories, ['preference', 'personal'])
      ?? sortLocalMemoriesByPriority(memories).find((item) => /cor favorita|cor preferida|cor favorita\/preferida/.test(stripAccents(`${item.title} ${item.content}`)))
      ?? null;
    const color = extractColorFromMemory(memory);
    if (color) return `Sua cor favorita/preferida é ${color}.`;
  }

  if (/\b(qual|quais|o que|resuma|resumo)\b/.test(normalizedQuestion) && /\b(banco|database)\b/.test(normalizedQuestion)) {
    const memory = findLocalMemoryByTags(memories, ['database'])
      ?? sortLocalMemoriesByPriority(memories).find((item) => /banco principal|supabase/.test(stripAccents(`${item.title} ${item.content}`)))
      ?? null;
    if (memory) return memory.content.replace(/^O /, 'O ');
  }

  if (/\b(proxima etapa|proximo passo|qual.*etapa)\b/.test(normalizedQuestion)) {
    const memory = findLocalMemoryByTags(memories, ['next-step'])
      ?? sortLocalMemoriesByPriority(memories).find((item) => /proxima etapa|proximo passo|action engine/.test(stripAccents(`${item.title} ${item.content}`)))
      ?? null;
    if (memory) return memory.content;
  }

  return null;
}



type LocalMemoryStats = {
  sessions: number;
  messages: number;
  memories: number;
  lastUse: string | null;
};

function readLocalMemoryStats(): LocalMemoryStats {
  if (typeof window === 'undefined') return { sessions: 0, messages: 0, memories: 0, lastUse: null };
  try {
    const raw = window.localStorage.getItem(LOCAL_MEMORY_STATS_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return {
      sessions: Number(data?.sessions ?? 0),
      messages: Number(data?.messages ?? 0),
      memories: Number(data?.memories ?? 0),
      lastUse: typeof data?.lastUse === 'string' ? data.lastUse : null
    };
  } catch {
    return { sessions: 0, messages: 0, memories: 0, lastUse: null };
  }
}

function writeLocalMemoryStats(stats: LocalMemoryStats) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_MEMORY_STATS_KEY, JSON.stringify(stats));
}

function updateLocalMemoryStats(memories: LocalMemory[], messageIncrement = 2) {
  const current = readLocalMemoryStats();
  writeLocalMemoryStats({
    sessions: Math.max(1, current.sessions || 0),
    messages: Math.max(0, current.messages || 0) + messageIncrement,
    memories: Math.max(Number(current.memories ?? 0), memories.length),
    lastUse: new Date().toISOString()
  });
}

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function buildSystemPrompt(persona: Persona, project?: ProjectSummary | null, localMemories: LocalMemory[] = []) {
  const projectContext = project
    ? `Projeto ativo no workspace: ${project.name}${project.description ? ` — ${project.description}` : ''}. Responda priorizando este projeto quando a pergunta depender de contexto.`
    : 'Projeto ativo no workspace: AURA/ARGUS AI Operating System.';
  const memoryContext = localMemories.length
    ? `MEMÓRIA LOCAL RECUPERADA DO CHAT — FATOS CONFIRMADOS PELO USUÁRIO:\n${sortLocalMemoriesByPriority(localMemories).map((item, index) => `${index + 1}. [P${Math.round(localMemoryPriorityScore(item))}] ${item.title}: ${item.content}`).join('\n')}\nRegras críticas de uso da memória: use estes fatos como fonte prioritária, respeitando a ordem de prioridade exibida. Quando o usuário perguntar sobre banco, deploy, framework, IA estratégica, IA operacional, próxima etapa, objetivo, arquitetura, editor, ambiente de desenvolvimento ou preferências pessoais como cor favorita/preferida, responda com base nestes fatos. Não diga que não possui registro quando o fato estiver listado acima. Diferencie fatos confirmados de inferências.`
    : 'MEMÓRIA LOCAL RECUPERADA DO CHAT: ainda sem registros nesta sessão/navegador.';
  return `${PERSONAS[persona].system}\n\n${USER_CONTEXT}\n\n${projectContext}\n\n${memoryContext}\n\nRegra crítica: mantenha sempre a identidade ${PERSONAS[persona].label}. Se o usuário perguntar quem é você, responda como ${PERSONAS[persona].label}. Se o usuário apenas informar um fato, confirme objetivamente e evite transformar a resposta em uma consultoria longa.`;
}
function AvatarDockCard({ persona, active, onClick }: { persona: Persona; active: boolean; onClick: () => void }) {
  const item = PERSONAS[persona];
  return (
    <button type="button" onClick={onClick} className={`chat-avatar-card ${persona} ${active ? 'is-active' : 'is-muted'}`}>
      <span className="chat-avatar-photo">
        <Image src={item.image} alt={`Avatar ${item.label}`} fill sizes="160px" className="object-cover" priority={persona === 'aura'} />
      </span>
      <span className="chat-avatar-info">
        <strong>{item.label}</strong>
        <small>{item.title}</small>
        <em>{active ? 'Ativo' : 'Em espera'}</em>
      </span>
    </button>
  );
}

export default function ChatPage() {
  const [persona, setPersona] = useState<Persona>('aura');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [localMemories, setLocalMemories] = useState<LocalMemory[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: PERSONAS.aura.intro, persona: 'aura', time: now(), meta: PERSONAS.aura.meta }
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const active = PERSONAS[persona];
  const activeProject = useMemo(() => projects.find((project) => project.id === projectId) ?? projects[0] ?? DEFAULT_PROJECT, [projectId, projects]);

  useEffect(() => {
    setLocalMemories(loadLocalMemories());
    const SpeechRecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognitionCtor) && typeof window.speechSynthesis !== 'undefined');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.assistantTheme = persona;
    window.localStorage.setItem('aura-argus-mode', persona);
  }, [persona]);

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        const data = await response.json();
        if (!mounted) return;
        const list = Array.isArray(data.projects) ? data.projects : [];
        setProjects(list);
        setProjectId((current) => current ?? data.activeProject?.id ?? list[0]?.id ?? null);
      } catch {
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setProjectsLoading(false);
      }
    }
    void loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 144)}px`;
  }, [input]);

  function switchPersona(next: Persona) {
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);
    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setPersona(next);
    setInput('');
  }

  function toggleListening() {
    if (!speechSupported) return;

    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setInput((current) => (current ? `${current} ${transcript.trim()}` : transcript.trim()));
      }
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' acontece naturalmente em pausas de silêncio — não deve
      // encerrar a escuta contínua, só erros reais (ex: permissão negada).
      if (event?.error === 'no-speech' || event?.error === 'aborted') return;
      shouldKeepListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      // Alguns navegadores encerram sozinhos após alguns segundos mesmo
      // com continuous=true. Se o usuário não pediu pra parar, reinicia.
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // instância não pôde reiniciar — encerra de fato
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    shouldKeepListeningRef.current = true;
    setIsListening(true);
    recognition.start();
  }

  function pickVoiceForPersona(targetPersona: Persona): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis?.getVoices?.() ?? [];
    const ptVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('pt'));
    const pool = ptVoices.length > 0 ? ptVoices : voices;
    const femaleHints = ['female', 'mulher', 'maria', 'luciana', 'fernanda', 'vitoria', 'vitória', 'camila'];
    const maleHints = ['male', 'homem', 'daniel', 'ricardo', 'felipe', 'joao', 'joão', 'antonio', 'antônio'];
    const hints = targetPersona === 'aura' ? femaleHints : maleHints;
    const matched = pool.find((voice) => hints.some((hint) => voice.name.toLowerCase().includes(hint)));
    return matched ?? pool[0];
  }

  function sanitizeForSpeech(raw: string): string {
    return raw
      // Remove emojis e outros símbolos pictográficos (o navegador às vezes
      // "descreve" o emoji em voz alta, ex: "cara sorrindo").
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu, '')
      // Remove marcação markdown comum (**negrito**, _itálico_, `código`)
      // que alguns motores de voz também tentam pronunciar.
      .replace(/[*_`~]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function speakMessage(text: string, index: number, msgPersona: Persona) {
    if (typeof window.speechSynthesis === 'undefined') return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sanitizeForSpeech(text));
    utterance.lang = 'pt-BR';
    const voice = pickVoiceForPersona(msgPersona);
    if (voice) utterance.voice = voice;
    // Reforço de diferenciação: mesmo quando o navegador só tem 1 voz pt-BR
    // disponível, o tom (pitch) garante que AURA e ARGUS não soem idênticos.
    utterance.pitch = msgPersona === 'aura' ? 1.2 : 0.82;
    utterance.rate = msgPersona === 'aura' ? 1.02 : 0.96;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  }

  function handleProjectChange(nextProjectId: string) {
    setProjectId(nextProjectId || null);
    setSessionId(null);
  }

  async function handleCreateProject() {
    const name = window.prompt('Nome do novo projeto');
    if (!name?.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await response.json();
      if (!response.ok || !data.project) {
        window.alert(data.error ?? 'Não foi possível criar o projeto.');
        return;
      }
      setProjects((prev) => [data.project, ...prev.filter((project) => project.id !== data.project.id)]);
      setProjectId(data.project.id);
      setSessionId(null);
    } catch {
      window.alert('Não foi possível criar o projeto agora.');
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    const selectedPersona = persona;
    const selectedProject = activeProject;
    const selectedMeta = PERSONAS[selectedPersona];

    setMessages((prev) => [...prev, { role: 'user', content: text, persona: selectedPersona, time: now() }]);
    setInput('');
    setIsSending(true);

    const capturedMemories = extractLocalMemories(text);
    const promptMemories = mergeLocalMemories(localMemories, capturedMemories);
    if (capturedMemories.length) {
      saveLocalMemories(promptMemories);
      setLocalMemories(promptMemories);
    }

    const localAnswer = resolveLocalMemoryAnswer(text, promptMemories, selectedMeta.label);
    if (localAnswer) {
      updateLocalMemoryStats(promptMemories, 1);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: localAnswer,
          persona: selectedPersona,
          meta: `${selectedMeta.label} · memória local · AURA/ARGUS AI Operating System`,
          time: now()
        }
      ]);
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          persona: selectedPersona,
          systemPrompt: buildSystemPrompt(selectedPersona, selectedProject, promptMemories),
          sessionId,
          projectId: selectedProject?.id ?? null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'error', content: data.error ?? 'Erro desconhecido ao chamar a IA.', persona: selectedPersona, time: now() }
        ]);
        return;
      }

      if (data.sessionId && typeof data.sessionId === 'string') {
        setSessionId(data.sessionId);
      }

      updateLocalMemoryStats(promptMemories, 2);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          persona: selectedPersona,
          meta: `${selectedMeta.label} · ${data.provider ?? 'router'} · ${data.model ?? 'modelo automático'}${data.project?.name ? ` · ${data.project.name}` : selectedProject?.name ? ` · ${selectedProject.name}` : ''}${data.fallbackUsed ? ' · fallback' : ''}`,
          time: now()
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: 'Não foi possível contatar /api/ai/chat. Verifique sua conexão.', persona: selectedPersona, time: now() }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <LivingBackground persona={persona} />
      <Header title="Chat IA" subtitle="Online" />
      <section className={`chat-os ${persona}`}>
        <div className="chat-shell-card">
          <div className="chat-avatar-dock" aria-label="Selecionar assistente">
            <AvatarDockCard persona="aura" active={persona === 'aura'} onClick={() => switchPersona('aura')} />
            <AvatarDockCard persona="argus" active={persona === 'argus'} onClick={() => switchPersona('argus')} />
          </div>

          <div className="chat-stream" ref={scrollRef}>
            {messages.map((msg, index) => {
              const msgPersona = msg.persona ?? persona;
              const p = PERSONAS[msgPersona];
              const isLatest = index === messages.length - 1;

              if (msg.role === 'error') {
                return (
                  <article key={index} className="chat-bubble chat-error">
                    <p>⚠️ {msg.content}</p>
                    {msg.time ? <time>{msg.time}</time> : null}
                  </article>
                );
              }

              if (msg.role === 'user') {
                return (
                  <article key={index} className={`chat-bubble chat-user ${msgPersona} ${isLatest ? 'is-latest' : ''}`}>
                    <p>{msg.content}</p>
                    {msg.time ? <time>{msg.time}</time> : null}
                  </article>
                );
              }

              return (
                <article key={index} className={`chat-bubble chat-assistant ${msgPersona} ${isLatest ? 'is-latest' : ''}`}>
                  <header>
                    <strong>{p.label}</strong>
                    <span>{p.title}</span>
                  </header>
                  <p>{msg.content}</p>
                  <footer>
                    {msg.meta ? <small>{msg.meta}</small> : <small>{p.meta}</small>}
                    {msg.time ? <time>{msg.time}</time> : null}
                    {speechSupported && (
                      <button
                        type="button"
                        className="chat-speak-button"
                        aria-label={speakingIndex === index ? 'Parar leitura' : 'Ouvir resposta'}
                        onClick={() => speakMessage(msg.content, index, msgPersona)}
                      >
                        {speakingIndex === index ? '⏹' : '🔊'}
                      </button>
                    )}
                  </footer>
                </article>
              );
            })}

            {isSending ? (
              <article className={`chat-bubble chat-assistant ${persona} is-thinking is-latest`}>
                <header>
                  <strong>{active.label}</strong>
                  <span className="sr-only">processando</span>
                </header>
                <div className="chat-processing" role="status" aria-label={`${active.label} está processando a resposta`}>
                  <span className="chat-processing-wave" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="chat-processing-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </article>
            ) : null}
          </div>

          <form
            className="chat-composer-dock"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              disabled={isSending}
              placeholder={active.placeholder}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <div className="chat-composer-actions">
              {speechSupported && (
                <button
                  type="button"
                  className={isListening ? 'chat-mic-button is-listening' : 'chat-mic-button'}
                  onClick={toggleListening}
                  aria-label={isListening ? 'Parar de ouvir' : 'Falar mensagem'}
                >
                  {isListening ? '⏺' : '🎙'}
                </button>
              )}
              <button type="submit" disabled={isSending || !input.trim()} aria-label="Enviar mensagem">
                ✦
              </button>
            </div>
            <span>Enter envia • Shift + Enter quebra linha • Persona ativa: {active.label}</span>
          </form>
        </div>
      </section>
    </>
  );
}
