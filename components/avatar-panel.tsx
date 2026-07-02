/**
 * components/avatar-panel.tsx
 * Avatar com FOTO real de AURA/ARGUS + animação por estado.
 *
 * O que este componente FAZ:
 * - Usa as fotos reais fornecidas pelo Product Owner
 *   (public/avatars/aura.webp, public/avatars/argus.webp).
 * - Anima a foto de forma diferente por estado (`idle`, `listening`,
 *   `thinking`, `speaking`) usando CSS (ver `.avatar-anim-*` em
 *   app/globals.css): respiração sutil, anel de "escuta" pulsando,
 *   pontos de "pensando", barras de "voz" sobre a foto ao falar.
 *
 * O que este componente NÃO FAZ (ver explicação completa no chat —
 * "níveis de avatar animado"):
 * - Não move a boca da foto de verdade (isso é lip-sync real e exige
 *   vídeo pré-gravado ou um serviço de avatar de IA de terceiros).
 * - Não analisa áudio do microfone nem resposta da IA.
 * Este componente é o "Nível 2" (foto real + animação por estado em
 * CSS) — um degrau acima do círculo abstrato da versão anterior, mas
 * ainda não é lip-sync fotorrealista (isso seria "Nível 3", uma
 * decisão de produto/orçamento à parte — ver docs/brand/avatares-animados.md).
 */
import Image from 'next/image';

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

const PERSONA_PHOTO = {
  aura: { src: '/avatars/aura.webp', label: 'AURA', ringColor: 'border-brand-violet' },
  argus: { src: '/avatars/argus.webp', label: 'ARGUS', ringColor: 'border-brand-cyan' }
} as const;

function photoAnimationClass(state: AvatarState): string {
  switch (state) {
    case 'listening':
      return 'avatar-anim-bob';
    case 'idle':
    default:
      return 'avatar-anim-idle';
  }
}

export function AvatarPanel({ persona = 'aura', state = 'idle' }: AvatarPanelProps) {
  const photo = PERSONA_PHOTO[persona];

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[.03] p-6 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Anéis pulsantes — estado "listening". */}
        {state === 'listening' && (
          <>
            <span className={`avatar-anim-ring absolute inset-0 rounded-full border-2 ${photo.ringColor}`} />
            <span
              className={`avatar-anim-ring absolute inset-0 rounded-full border-2 ${photo.ringColor}`}
              style={{ animationDelay: '0.6s' }}
            />
          </>
        )}

        <div
          className={`relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/15 shadow-lg ${photoAnimationClass(state)}`}
        >
          <Image
            src={photo.src}
            alt={`Avatar de ${photo.label}`}
            fill
            sizes="112px"
            className="object-cover"
            priority={false}
          />

          {/* Overlay de "pensando" — pontos saltitantes sobre a foto. */}
          {state === 'thinking' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="flex items-end gap-1" aria-hidden>
                <span className="avatar-anim-dot h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0s' }} />
                <span className="avatar-anim-dot h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0.15s' }} />
                <span className="avatar-anim-dot h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0.3s' }} />
              </span>
            </div>
          )}

          {/* Overlay de "falando" — barras de voz na base da foto. */}
          {state === 'speaking' && (
            <div className="absolute inset-x-0 bottom-0 flex h-7 items-end justify-center gap-[3px] bg-gradient-to-t from-black/60 to-transparent pb-1.5">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="avatar-anim-wave w-1 rounded-full bg-white"
                  style={{ height: '60%', animationDelay: `${bar * 0.08}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{photo.label}</p>
        <p className="text-xs text-slate-500">{STATE_LABEL[state]} — avatar com foto real</p>
      </div>
    </div>
  );
}
