/**
 * components/product-card.tsx
 * Card de apresentação "AURA / ARGUS" — pensado para ser usado como um
 * bloco/seção dentro de uma página maior (ex: um card entre outros
 * serviços da PSF Editora e Consultoria), e não como a página inteira.
 * Ver também public/aura-argus-card.html para uma versão estática
 * (HTML puro, sem Next.js) do mesmo card, caso o site principal não
 * seja construído em Next.js/React.
 */
import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo-mark';

export function ProductCard() {
  return (
    <div className="aura-card aura-glow max-w-md rounded-3xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
        <LogoMark size={56} />
      </div>
      <h3 className="text-2xl font-black text-white">AURA / ARGUS</h3>
      <p className="mt-2 bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-sm font-semibold text-transparent">
        Solução definitiva em assistentes de IA pessoal
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        Dois assistentes, um núcleo: AURA para produtividade e escrita,
        ARGUS para tecnologia e automação.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        Conhecer AURA / ARGUS
      </Link>
    </div>
  );
}
