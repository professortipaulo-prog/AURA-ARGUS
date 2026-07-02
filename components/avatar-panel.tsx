/**
 * components/avatar-panel.tsx
 * Avatar placeholder ANIMADO (item obrigatório da tarefa inicial,
 * ajustado após feedback do Product Owner: "os avatares não são
 * estáticos, eles se movimentam, principalmente quando falam e
 * interagem").
 *
 * O que este componente FAZ:
 * - Anima o avatar de forma diferente para cada estado
 *   (`idle`, `listening`, `thinking`, `speaking`), usando apenas CSS
 *   (ver `.avatar-anim-*` em app/globals.css). Isso já dá a sensação de
 *   "estar vivo" mesmo sem IA, voz ou câmera reais.
 *
 * O que este componente NÃO FAZ (fora de escopo desta sprint):
 * - Não faz lip-sync real (sincronizar boca com áudio de verdade).
 * - Não analisa áudio do microfone nem resposta da IA.
 * - Não é um avatar 3D/vídeo — é um placeholder em CSS/SVG.
 * A implementação real (Avatar Engine com visemas e lip-sync a partir
 * de áudio real) é trabalho futuro de `modules/avatar`, conforme
 * Sprint-002.md §9 (Eyes/Face/Mouth Engine, Lip Sync, Expressions).
 */
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AvatarPanelProps {
  persona?: 'aura' | 'argus';
  state?: AvatarState;
}

const STATE_LABEL: Record<AvatarState, string> = {
  idle: 'Em repouso',
  listening: 'Ouvindo',
  thinking: 'Pensando',
  speaking: 'Falando'
};

const PERSONA_STYLE = {
  aura: { gradient: 'from-brand-violet to-brand-indigo', label: 'AURA' },
  argus: { gradient: 'from-slate-800 to-brand-cyan', label: 'ARGUS' }
} as const;

/** Classe de animação do círculo do avatar, por estado. */
function circleAnimationClass(state: AvatarState): string {
  switch (state) {
    case 'listening':
      return 'avatar-anim-bob';
    case 'thinking':
      return 'avatar-anim-idle';
    case 'speaking':
      return 'avatar-anim-bob';
    case 'idle':
    default:
      return 'avatar-anim-idle';
  }
}

export function AvatarPanel({ persona = 'aura', state = 'idle' }: AvatarPanelProps) {
  const style = PERSONA_STYLE[persona];

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[.03] p-6 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Anéis pulsantes — apenas no estado "listening". */}
        {state === 'listening' && (
          <>
            <span className="avatar-anim-ring absolute inset-0 rounded-full border-2 border-brand-cyan" />
            <span
              className="avatar-anim-ring absolute inset-0 rounded-full border-2 border-brand-cyan"
              style={{ animationDelay: '0.6s' }}
            />
          </>
        )}

        <div
          className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient} text-2xl font-black text-white shadow-lg ${circleAnimationClass(state)}`}
          aria-hidden
        >
          {state === 'thinking' ? (
            <span className="flex items-end gap-1" aria-hidden>
              <span className="avatar-anim-dot h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0s' }} />
              <span className="avatar-anim-dot h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0.15s' }} />
              <span className="avatar-anim-dot h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0.3s' }} />
            </span>
          ) : state === 'speaking' ? (
            <span className="flex h-5 items-end gap-[3px]" aria-hidden>
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="avatar-anim-wave w-1 rounded-full bg-white"
                  style={{ height: '100%', animationDelay: `${bar * 0.08}s` }}
                />
              ))}
            </span>
          ) : (
            style.label[0]
          )}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{style.label}</p>
        <p className="text-xs text-slate-500">{STATE_LABEL[state]} — avatar placeholder animado</p>
      </div>
    </div>
  );
}
