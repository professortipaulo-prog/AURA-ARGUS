'use client';

import { useState } from 'react';
import { AvatarPanel } from '@/components/avatar-panel';

export function DashboardAvatarSwitcher() {
  const [persona, setPersona] = useState<'aura' | 'argus'>('aura');

  return (
    <div className="aios-dashboard-avatar-switcher">
      <div className="aios-avatar-toggle">
        <button
          type="button"
          className={persona === 'aura' ? 'is-active' : ''}
          onClick={() => setPersona('aura')}
        >
          AURA
        </button>
        <button
          type="button"
          className={persona === 'argus' ? 'is-active' : ''}
          onClick={() => setPersona('argus')}
        >
          ARGUS
        </button>
      </div>
      <AvatarPanel persona={persona} state="idle" large />
    </div>
  );
}
