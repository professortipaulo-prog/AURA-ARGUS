import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AURA / ARGUS',
  description: 'Assistente profissional inteligente para vida, trabalho, documentos, memoria e automacoes.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
