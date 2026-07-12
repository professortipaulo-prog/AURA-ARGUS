'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BetaSignupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{ remaining: number; total: number; open: boolean } | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/beta/status')
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ remaining: 0, total: 15, open: false }));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!lgpdConsent) {
      setError('É necessário aceitar os termos de uso de dados para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, dateOfBirth, guardianName, guardianEmail, lgpdConsent })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? 'Não foi possível concluir o cadastro.');
        return;
      }
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="aios-beta-shell">
        <div className="aios-beta-card">
          <h1>🎉 Cadastro concluído!</h1>
          <p>Sua conta foi criada. Seu teste de 7 dias começa a contar a partir do seu primeiro acesso — então só entra quando estiver pronto(a) para começar a usar de verdade.</p>
          <button className="aios-primary-button" onClick={() => router.push('/login')}>Ir para o login</button>
        </div>
      </div>
    );
  }

  if (status && (!status.open || status.remaining <= 0)) {
    return (
      <div className="aios-beta-shell">
        <div className="aios-beta-card">
          <h1>Vagas encerradas</h1>
          <p>As vagas do teste beta do AURA &amp; ARGUS já foram todas preenchidas. Obrigado pelo interesse!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aios-beta-shell">
      <form className="aios-beta-card" onSubmit={handleSubmit}>
        <h1>Teste Beta — AURA &amp; ARGUS Estudantil</h1>
        <p className="aios-muted">
          {status ? `${status.remaining} de ${status.total} vagas disponíveis.` : 'Carregando vagas...'}
        </p>
        <p className="aios-muted">
          Acesso gratuito por 7 dias, contados a partir do seu primeiro login (não da data deste cadastro).
        </p>

        <label className="aios-beta-toggle">
          <input type="checkbox" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} />
          Estou me cadastrando como responsável por um(a) menor de 18 anos
        </label>

        <label className="aios-form-control">
          <span>{isMinor ? 'Nome completo do(a) aluno(a)' : 'Nome completo'}</span>
          <input className="aios-input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>

        <label className="aios-form-control">
          <span>Data de nascimento {isMinor ? 'do(a) aluno(a)' : ''}</span>
          <input className="aios-input" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </label>

        {isMinor ? (
          <>
            <label className="aios-form-control">
              <span>Nome completo do responsável</span>
              <input className="aios-input" required value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            </label>
            <label className="aios-form-control">
              <span>E-mail do responsável (será usado para o login)</span>
              <input className="aios-input" type="email" required value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
            </label>
          </>
        ) : (
          <label className="aios-form-control">
            <span>E-mail</span>
            <input className="aios-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        )}

        <label className="aios-form-control">
          <span>Crie uma senha (mínimo 8 caracteres)</span>
          <input className="aios-input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <label className="aios-beta-toggle">
          <input type="checkbox" checked={lgpdConsent} onChange={(e) => setLgpdConsent(e.target.checked)} required />
          {isMinor
            ? 'Declaro que sou responsável legal pelo(a) menor indicado(a) acima e autorizo, conforme a LGPD, o uso dos dados informados para criação e uso da conta de teste do AURA & ARGUS por 7 dias.'
            : 'Aceito o uso dos meus dados, conforme a LGPD, para criação e uso desta conta de teste do AURA & ARGUS por 7 dias.'}
        </label>

        {error && (
          <div className="aios-action-result error">
            <p>{error}</p>
          </div>
        )}

        <button className="aios-primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar minha conta de teste'}
        </button>
      </form>
    </div>
  );
}
