import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">A</div>
          <div><p className="font-bold text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Acesso seguro</p></div>
        </Link>
        <h1 className="text-3xl font-bold text-white">Entrar</h1>
        <p className="mt-2 text-sm text-slate-400">Tela preparada para Supabase Auth. A autenticacao real sera ativada na Sprint 006.</p>
        <form className="mt-8 space-y-4">
          <Input type="email" placeholder="E-mail" />
          <Input type="password" placeholder="Senha" />
          <Button className="w-full">Entrar no painel</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Ainda nao tem conta? <Link href="/register" className="text-indigo-300">Criar acesso</Link></p>
      </Card>
    </main>
  );
}
