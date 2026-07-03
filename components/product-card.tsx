import Link from 'next/link';

export function ProductCard() {
  return (
    <article className="psf-product-card" id="core">
      <div className="psf-product-icon">🤖</div>
      <p className="psf-card-kicker">Produto de IA da PSF</p>
      <h3>AURA / ARGUS</h3>
      <p>
        Assistentes personalizados para vida profissional, documentos, fluxos assistidos por IA,
        engenharia de prompt, automações, memória e supervisão estratégica.
      </p>
      <ul>
        <li>Assistente AURA para conversa, escrita e produtividade</li>
        <li>ARGUS para monitoramento, análise e automações</li>
        <li>Integração com Claude, Gemini, Supabase e Vercel</li>
      </ul>
      <Link href="https://aura-argus.vercel.app/" target="_blank" rel="noreferrer" className="psf-product-link">
        Abrir AURA / ARGUS
      </Link>
    </article>
  );
}
