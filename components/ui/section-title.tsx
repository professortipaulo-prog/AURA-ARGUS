export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[.35em] text-cyan-200/80">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-3xl font-black text-white md:text-5xl">{title}</h2>
      <p className="mt-5 text-base leading-8 text-slate-400">{description}</p>
    </div>
  );
}
