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
      setWarning('Acesso liberado. Perfil será sincronizado quando o banco estiver disponível.');
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="auth-screen">
      <LivingBackground mode="auth" />
      <section className="auth-card">
        <Link href="/" className="auth-brand" aria-label="Voltar para a página inicial">
          <span className="auth-logo">⬡</span>
          <span><strong>AURA / ARGUS</strong><small>Acesso seguro</small></span>
        </Link>
        <h1>Entrar</h1>
        <p>Acesse seu núcleo operacional de IA.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" placeholder="E-mail ou usuário" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Senha" required />
          {error ? <div className="auth-error">{error}</div> : null}
          {warning ? <div className="auth-warning">{warning}</div> : null}
          <button type="submit" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar no painel'}</button>
        </form>
        <p className="auth-footer">Ainda não tem conta? <Link href="/register">Criar acesso</Link></p>
      </section>
    </main>
  );
}
