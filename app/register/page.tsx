import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-2xl">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">A</div>
          <div><p className="font-bold text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Cadastro inicial</p></div>
        </Link>
        <h1 className="text-3xl font-bold text-white">Criar perfil</h1>
        <p className="mt-2 text-sm text-slate-400">Primeira versao do formulario de perfil pessoal, profissional e comportamental.</p>
        <form className="mt-8 grid gap-4 md:grid-cols-2">
          <Input placeholder="Nome completo" />
          <Input type="email" placeholder="E-mail" />
          <Input placeholder="Cargo / profissao" />
          <Input placeholder="Empresa / organizacao" />
          <Input type="password" placeholder="Senha" />
          <Input placeholder="Perfil DISC predominante" />
          <Textarea placeholder="Conte como o AURA/ARGUS deve ajudar voce" className="md:col-span-2" rows={5} />
          <Button className="md:col-span-2">Criar acesso</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Ja tem conta? <Link href="/login" className="text-indigo-300">Entrar</Link></p>
      </Card>
    </main>
  );
}
