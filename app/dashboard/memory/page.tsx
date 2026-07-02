import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
const items=['Memória temporária','Memória de sessão','Memória de projeto','Memória permanente','Embeddings e recuperação semântica'];
export default function Page(){return <><Header title="Memória" subtitle="Camadas de contexto do assistente."/><section className="grid gap-4 p-5 lg:grid-cols-2 lg:p-8">{items.map(i=><Card key={i}><h2 className="font-bold text-white">{i}</h2><p className="mt-2 text-sm text-slate-400">Estrutura preparada para integração com pgvector e Supabase.</p></Card>)}</section></>}
