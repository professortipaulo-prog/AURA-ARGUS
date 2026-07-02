import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/ui/status-pill';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="hud-grid" />
      <Card className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="brand-mark">A</div>
          <div><p className="font-black tracking-[.16em] text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Acesso seguro</p></div>
        </Link>
        <div className="mb-4"><StatusPill>Supabase Auth preparado</StatusPill></div>
        <h1 className="text-3xl font-black text-white">Entrar no cockpit</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Tela visual pronta para autenticação real. Na próxima etapa, este formulário será conectado ao Supabase Auth.</p>
        <form className="mt-8 space-y-4">
          <Input type="email" placeholder="E-mail" />
          <Input type="password" placeholder="Senha" />
          <Button href="/dashboard" className="w-full">Entrar no painel</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Ainda não tem conta? <Link href="/register" className="text-cyan-200">Criar acesso</Link></p>
      </Card>
    </main>
  );
}
