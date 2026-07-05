import Link from 'next/link';
import { LivingBackground } from '@/components/living-background';

export default function RegisterPage() {
  return (
    <main className="aios-login-page">
      <LivingBackground persona="aura" />
      <section className="aios-login-card aios-register-locked-card">
        <Link href="/" className="aios-login-brand">
          <span>A</span>
          <div>
            <strong>AURA / ARGUS</strong>
            <p>Cadastro inicial</p>
          </div>
        </Link>

        <p className="psfhome-eyebrow"><i /> Cadastro em desenvolvimento</p>
        <h1>Cadastro em desenvolvimento</h1>
        <p>
          O AURA/ARGUS ainda está em fase de estabilização.
        </p>
        <p>
          O acesso será liberado em breve.
        </p>
        <p>
          Enquanto isso utilize uma conta existente.
        </p>

        <Link className="aios-auth-return" href="/login">
          Voltar ao Login
        </Link>
      </section>
    </main>
  );
}
