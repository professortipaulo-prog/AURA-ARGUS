'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const VALID_USERS = ['paulofilho', 'professortipaulo@gmail.com'];
const VALID_PASSWORD = 'F1lho@tomo2026';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedLogin = login.trim().toLowerCase();

    if (!VALID_USERS.includes(normalizedLogin) || password !== VALID_PASSWORD) {
      setError('Acesso nao autorizado. Use o administrador configurado para esta versao.');
      return;
    }

    window.localStorage.setItem(
      'aura_argus_demo_session',
      JSON.stringify({
        user: 'paulofilho',
        email: 'professortipaulo@gmail.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      })
    );

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">A</div>
          <div><p className="font-bold text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Acesso seguro</p></div>
        </Link>
        <h1 className="text-3xl font-bold text-white">Entrar</h1>
        <p className="mt-2 text-sm text-slate-400">Acesso administrativo temporario ate ativarmos o Supabase Auth definitivo.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Usuario ou e-mail"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" className="w-full">Entrar no painel</Button>
        </form>
        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-xs leading-6 text-slate-400">
          <p><strong className="text-cyan-200">Acesso demo admin:</strong></p>
          <p>Usuario: <span className="text-white">paulofilho</span></p>
          <p>E-mail: <span className="text-white">professortipaulo@gmail.com</span></p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Ainda nao tem conta? <Link href="/register" className="text-indigo-300">Criar acesso</Link></p>
      </Card>
    </main>
  );
}
