'use client';

import { useEffect, useState } from 'react';

type Client = {
  userId: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  lastSeenAt: string | null;
};

export function ClientsPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function loadClients() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();
      setClients(data.clients ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  async function handleInvite() {
    if (!fullName.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Preencha nome e e-mail.' });
      return;
    }
    setInviting(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim() })
      });
      const data = await response.json();
      if (!data.ok) {
        setMessage({ type: 'error', text: data.error ?? 'Não foi possível enviar o convite.' });
        return;
      }
      setMessage({ type: 'ok', text: `Convite enviado para ${email.trim()}. O cliente vai definir a própria senha pelo e-mail recebido.` });
      setFullName('');
      setEmail('');
      await loadClients();
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="aios-panel">
      <div className="aios-action-title-row">
        <div>
          <p className="aios-kicker">GESTÃO DE CLIENTES</p>
          <h2>Usuários e papéis</h2>
          <p className="aios-muted">
            Você cria a conta do cliente aqui — ele recebe um convite por e-mail e define a própria senha.
            Você não tem acesso às conversas, documentos ou memória dele; só a esta lista de contas.
          </p>
        </div>
      </div>

      <div className="aios-form-control" style={{ marginBottom: 18 }}>
        <span>Convidar novo cliente</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="aios-input" placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
          <input className="aios-input" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
          <button className="aios-primary-button" onClick={handleInvite} disabled={inviting}>
            {inviting ? 'Enviando...' : 'Enviar convite'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`aios-action-result ${message.type === 'ok' ? 'ok' : 'error'}`} style={{ marginBottom: 18 }}>
          <p>{message.text}</p>
        </div>
      )}

      {loading ? (
        <p className="aios-muted">Carregando...</p>
      ) : clients.length === 0 ? (
        <p className="aios-muted">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="aios-capability-list">
          {clients.map((client) => (
            <div className="aios-capability" key={client.userId}>
              <div>
                <strong>{client.fullName ?? client.email}</strong>
                <p className="aios-muted">
                  {client.email} · papel: {client.role} · desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                  {client.lastSeenAt ? ` · último acesso ${new Date(client.lastSeenAt).toLocaleDateString('pt-BR')}` : ' · ainda não acessou'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
