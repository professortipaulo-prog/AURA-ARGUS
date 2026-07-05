'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { normalizeLoginIdentifier } from '@/lib/auth/constants';
import { LivingBackground } from '@/components/living-background';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const email = normalizeLoginIdentifier(identifier);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' ? 'E-mail/usuário ou senha inválidos.' : loginError.message);
      setIsLoading(false);
      return;
    }

    await fetch('/api/auth/profile', { method: 'POST' }).catch(() => null);
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="aios-login-page">
      <LivingBackground persona="argus" />
      <section className="aios-login-card">
        <Link href="/" className="aios-login-brand">
          <span>⬡</span>
          <div><strong>AURA / ARGUS</strong><p>AI Operating System</p></div>
        </Link>
        <h1>Acesso seguro</h1>
        <p>Entre com suas credenciais para acessar o núcleo operacional AURA/ARGUS.</p>
        <form onSubmit={handleSubmit}>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" placeholder="E-mail ou usuário" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Senha" required />
          {error ? <div className="aios-login-error">{error}</div> : null}
          <button type="submit" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar no sistema'}</button>
        </form>
      </section>
    </main>
  );
}
