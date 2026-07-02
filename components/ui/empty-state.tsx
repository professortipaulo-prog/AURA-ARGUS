import { Button } from './button';

export function EmptyState({ title, description, action, href }: { title: string; description: string; action?: string; href?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.03] p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-2xl">✦</div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">{description}</p>
      {action && href ? <Button href={href} className="mt-6">{action}</Button> : null}
    </div>
  );
}
