'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [discProfile, setDiscProfile] = useState('');
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess('Cadastro criado. Confirme seu e-mail para entrar, se a confirmação estiver ativa no Supabase.');
      setIsLoading(false);
      return;
    }

    const profileResponse = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, professionalTitle, company, discProfile, preferences })
    });

    if (!profileResponse.ok) {
      const response = await profileResponse.json().catch(() => null);
      setError(response?.error ?? 'Cadastro criado, mas não foi possível salvar o perfil.');
      setIsLoading(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-2xl">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">A</div>
          <div><p className="font-bold text-white">AURA / ARGUS</p><p className="text-xs text-slate-500">Cadastro inicial</p></div>
        </Link>
        <h1 className="text-3xl font-bold text-white">Criar perfil</h1>
        <p className="mt-2 text-sm text-slate-400">Cadastro real integrado ao Supabase Auth e ao perfil em core.profiles.</p>
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" required />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail" required />
          <Input value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} placeholder="Cargo / profissao" />
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa / organizacao" />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" minLength={8} required />
          <Input value={discProfile} onChange={(e) => setDiscProfile(e.target.value)} placeholder="Perfil DISC predominante" />
          <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Conte como o AURA/ARGUS deve ajudar voce" className="md:col-span-2" rows={5} />
          {error ? <div className="md:col-span-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div> : null}
          {success ? <div className="md:col-span-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{success}</div> : null}
          <Button className="md:col-span-2" type="submit" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar acesso'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Ja tem conta? <Link href="/login" className="text-indigo-300">Entrar</Link></p>
      </Card>
    </main>
  );
}
