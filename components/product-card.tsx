/**
 * Card AURA/ARGUS para uso dentro do ecossistema PSF.
 * Deve substituir o card genérico de IA no site/landing da PSF.
 */
import Link from 'next/link';

export function ProductCard() {
  return (
    <Link href="https://aura-argus.vercel.app/" className="psf-product-card" target="_blank">
      <span className="psf-product-icon">◉</span>
      <h3>AURA / ARGUS</h3>
      <p>Seu sistema operacional de IA pessoal para trabalho, vida profissional, documentos e automações.</p>
      <ul>
        <li>AURA: raciocínio, escrita e ação</li>
        <li>ARGUS: gestão, supervisão e integrações</li>
        <li>Claude + Gemini com memória contextual</li>
      </ul>
    </Link>
  );
}
