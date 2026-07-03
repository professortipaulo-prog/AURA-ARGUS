import Image from 'next/image';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AvatarPanelProps {
  persona?: 'aura' | 'argus';
  state?: AvatarState;
}

const STATE_LABEL: Record<AvatarState, string> = {
  idle: 'Em repouso',
  listening: 'Ouvindo',
  thinking: 'Analisando',
  speaking: 'Falando'
};

const PERSONA_PHOTO = {
  aura: { src: '/avatars/aura.webp', label: 'AURA', role: 'Assistente estratégica', className: 'avatar-aura' },
  argus: { src: '/avatars/argus.webp', label: 'ARGUS', role: 'Agente de execução', className: 'avatar-argus' }
} as const;

export function AvatarPanel({ persona = 'aura', state = 'idle' }: AvatarPanelProps) {
  const photo = PERSONA_PHOTO[persona];

  return (
    <div className={`living-avatar-card ${photo.className}`} data-state={state}>
      <div className="living-avatar-stage">
        <span className="avatar-ring avatar-ring-one" />
        <span className="avatar-ring avatar-ring-two" />
        <span className="avatar-hud-circle" />
        <div className={`living-avatar-photo avatar-state-${state}`}>
          <Image src={photo.src} alt={`Avatar de ${photo.label}`} fill sizes="150px" className="object-cover" priority={false} />
          <span className="avatar-eye-glint avatar-eye-left" />
          <span className="avatar-eye-glint avatar-eye-right" />
          <span className="avatar-mouth-pulse" />
          {state === 'thinking' && <span className="avatar-thinking-orbit" />}
          {state === 'speaking' && (
            <div className="avatar-sound-bars" aria-hidden>
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                <span key={bar} style={{ animationDelay: `${bar * 0.065}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="living-avatar-name">{photo.label}</p>
        <p className="living-avatar-role">{photo.role}</p>
        <p className="living-avatar-state">{STATE_LABEL[state]}</p>
      </div>
    </div>
  );
}
