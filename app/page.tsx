import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoWithWordmark } from '@/components/brand/logo-mark';

const modules = ['AI Router', 'Memory Manager', 'Action Manager', 'Document Engine', 'Voice Always-on', 'FaceID', 'Google Drive', 'OneDrive'];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-6 lg:px-12">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-white/[.04] px-5 py-4 backdrop-blur-xl">
        <LogoWithWordmark subtitle="Assistentes Inteligentes" />
        <div className="hidden gap-2 md:flex">
          <ThemeToggle />
          <Button href="/login" variant="ghost">Entrar</Button>
          <Button href="/dashboard">Abrir painel</Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 py-20 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge>Sprint 005 — Foundation UI</Badge>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black tracking-tight text-white md:text-7xl">
            Seu sistema operacional de IA para trabalho, vida profissional e documentos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            AURA e ARGUS nascem como um assistente corporativo com memoria, voz, agentes, automacoes e integracao com Supabase, Vercel, Google Drive, OneDrive, Gmail, Outlook e NotebookLM.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/register">Criar acesso</Button>
            <Button href="/dashboard" variant="secondary">Ver dashboard</Button>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <StatCard label="Infra" value="OK" detail="Supabase + Vercel" />
            <StatCard label="Banco" value="DB" detail="Schemas e RLS" />
            <StatCard label="Deploy" value="Live" detail="GitHub conectado" />
          </div>
        </div>

        <Card className="aura-glow overflow-hidden">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">ARGUS observando</p>
              <p className="text-xs text-slate-500">Rotas, memoria e acoes</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">online</span>
          </div>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <div key={module} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-sm text-indigo-200">{index + 1}</span>
                  <span className="text-sm font-medium text-slate-200">{module}</span>
                </div>
                <span className="text-xs text-slate-500">preparado</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
