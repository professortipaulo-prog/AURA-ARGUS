'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { normalizeLoginIdentifier } from '@/lib/auth/constants';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setWarning(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const email = normalizeLoginIdentifier(identifier);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' ? 'E-mail/usuário ou senha inválidos.' : loginError.message);
      setIsLoading(false);
      return;
    }

    const profileResponse = await fetch('/api/auth/profile', { method: 'POST' });
    const profileData = await profileResponse.json().catch(() => null);

    if (!profileResponse.ok) {
      setError(profileData?.error ?? 'Login feito, mas não foi possível preparar o perfil.');
      setIsLoading(false);
      return;
    }

    if (profileData?.warnings?.length) {
      setWarning('Acesso liberado. Perfil será sincronizado quando o schema core estiver exposto no Supabase.');
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">A</div>
          <div><p className="font-bold text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Acesso seguro</p></div>
        </Link>
        <h1 className="text-3xl font-bold text-white">Entrar</h1>
        <p className="mt-2 text-sm text-slate-400">Acesse com suas credenciais cadastradas no AURA/ARGUS.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" placeholder="E-mail ou usuário" required />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Senha" required />
          {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div> : null}
          {warning ? <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{warning}</div> : null}
          <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar no painel'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Ainda nao tem conta? <Link href="/register" className="text-indigo-300">Criar acesso</Link></p>
      </Card>
    </main>
  );
}
