import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AURA / ARGUS',
  description: 'Sistema operacional profissional de IA para trabalho, documentos, memória e automações.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-assistant-theme="argus">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('aura-argus-mode');if(t==='aura'||t==='argus'){document.documentElement.dataset.assistantTheme=t;}}catch(e){}`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
