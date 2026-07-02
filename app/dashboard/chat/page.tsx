import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  return (
    <>
      <Header title="Chat IA" subtitle="Base visual para conversa com AURA e ARGUS." />
      <section className="grid gap-6 p-5 lg:grid-cols-[1fr_340px] lg:p-8">
        <Card className="min-h-[620px]">
          <div className="space-y-4">
            <div className="max-w-xl rounded-3xl bg-white/[.06] p-4 text-sm text-slate-300">Olá, Paulo. Sou o AURA. Nesta Sprint minha interface está pronta; na próxima eu conecto autenticação, memória e provedores de IA.</div>
            <div className="ml-auto max-w-xl rounded-3xl bg-indigo-500 p-4 text-sm text-white">Quero transformar isso em meu assistente profissional completo.</div>
          </div>
          <div className="mt-8 flex gap-3">
            <Textarea rows={3} placeholder="Digite sua solicitação..." />
            <Button>Enviar</Button>
          </div>
        </Card>
        <Card>
          <h2 className="font-bold text-white">Contexto ativo</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>Projeto: AURA/ARGUS</p><p>Modo: Profissional</p><p>Memoria: Preparada</p><p>Roteamento: Gemini / Claude / OpenAI</p>
          </div>
        </Card>
      </section>
    </>
  );
}
