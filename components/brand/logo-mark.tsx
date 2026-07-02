/**
 * components/brand/logo-mark.tsx
 * Marca AURA/ARGUS — hexágono com "olho", gradiente violeta → ciano,
 * conforme o material de branding de referência (ver
 * docs/brand/aura-argus-reference.png). Usado no cabeçalho da landing
 * page e na barra lateral do dashboard, substituindo o quadrado com a
 * letra "A" usado como placeholder na Sprint 005.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const gradientId = 'aura-argus-logo-gradient';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path
        d="M20 2 L36 11 V29 L20 38 L4 29 V11 Z"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        fill="rgba(124,58,237,0.08)"
      />
      <circle cx="20" cy="20" r="7.5" stroke={`url(#${gradientId})`} strokeWidth="2.2" fill="none" />
      <circle cx="20" cy="20" r="2.6" fill={`url(#${gradientId})`} />
    </svg>
  );
}

/** Logo + wordmark "AURA / ARGUS", pronto para cabeçalhos. */
export function LogoWithWordmark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div>
        <p className="font-bold leading-tight text-white">
          <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">AURA</span>
          {' / '}
          <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">ARGUS</span>
        </p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
