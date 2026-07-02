export function StatusPill({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'green' | 'amber' | 'indigo' }) {
  const tones = {
    cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
    green: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    amber: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
    indigo: 'border-indigo-300/25 bg-indigo-300/10 text-indigo-100'
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
