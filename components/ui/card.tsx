import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`aura-card rounded-3xl p-6 ${className}`}>{children}</div>;
}
