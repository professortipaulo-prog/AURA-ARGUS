'use client';

import Image from 'next/image';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AvatarPanelProps {
  persona?: 'aura' | 'argus';
  state?: AvatarState;
  large?: boolean;
}

const avatarData = {
  aura: {
    src: '/avatars/aura.webp',
    label: 'AURA',
    subtitle: 'Assistente estratégica',
    specialty: 'Estratégia, organização e produção'
  },
  argus: {
    src: '/avatars/argus.webp',
    label: 'ARGUS',
    subtitle: 'Assistente operacional',
    specialty: 'Execução, automação e análise técnica'
  }
} as const;

export function AvatarPanel({ persona = 'aura', state = 'idle', large = false }: AvatarPanelProps) {
  const avatar = avatarData[persona];
  return (
    <section className={`aios-avatar-card aios-avatar-${persona} ${large ? 'is-large' : ''}`}>
      <div className="aios-avatar-stage">
        <span className="aios-avatar-halo" />
        <span className="aios-avatar-halo secondary" />
        <div className={`aios-avatar-photo avatar-state-${state}`}>
          <Image src={avatar.src} alt={`Avatar ${avatar.label}`} fill sizes="320px" className="object-cover" priority={false} />
          <span className="avatar-eye eye-left" />
          <span className="avatar-eye eye-right" />
          <span className="avatar-mouth" />
          {state === 'speaking' ? <span className="avatar-wave-line" /> : null}
        </div>
      </div>
      <h2>{avatar.label}</h2>
      <p>{avatar.subtitle}</p>
      <span className="aios-online"><i />Online</span>
      <small>{avatar.specialty}</small>
    </section>
  );
}
