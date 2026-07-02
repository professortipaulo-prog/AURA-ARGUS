import type { ReactNode } from 'react';
export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">{children}</span>;
}
