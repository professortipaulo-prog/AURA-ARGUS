import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { StatusPill } from '@/components/ui/status-pill';

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="hud-grid" />
      <Card className="relative z-10 w-full max-w-3xl">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="brand-mark">A</div>
          <div><p className="font-black tracking-[.16em] text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Perfil inicial</p></div>
        </Link>
        <div className="mb-4"><StatusPill tone="indigo">Formulário de contexto</StatusPill></div>
        <h1 className="text-3xl font-black text-white">Criar perfil profissional</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Primeira versão do formulário pessoal, profissional e comportamental para que AURA/ARGUS aprenda a atuar de forma contextual.</p>
        <form className="mt-8 grid gap-4 md:grid-cols-2">
          <Input placeholder="Nome completo" />
          <Input type="email" placeholder="E-mail" />
          <Input placeholder="Cargo / profissão" />
          <Input placeholder="Empresa / organização" />
          <Input type="password" placeholder="Senha" />
          <Input placeholder="Perfil DISC predominante" />
          <Textarea placeholder="Conte como AURA/ARGUS deve ajudar você" className="md:col-span-2" rows={5} />
          <Button href="/dashboard" className="md:col-span-2">Criar acesso</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Já tem conta? <Link href="/login" className="text-cyan-200">Entrar</Link></p>
      </Card>
    </main>
  );
}
