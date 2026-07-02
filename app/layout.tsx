import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AURA / ARGUS',
  description: 'Assistente profissional inteligente para vida, trabalho, documentos, memoria e automacoes.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Evita flash de tema incorreto: aplica a preferência salva antes da pintura inicial. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('aura-argus-theme');if(t==='light'){document.documentElement.classList.add('theme-light');}}catch(e){}`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
