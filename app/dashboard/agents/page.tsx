import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
const agents=['AURA - Assistente pessoal','ARGUS - Observador e executor','Consultor documental','Arquiteto de prompts'];
export default function Page(){return <><Header title="Agentes" subtitle="Perfis especializados de IA."/><section className="grid gap-4 p-5 md:grid-cols-2 lg:p-8">{agents.map(a=><Card key={a}><h2 className="font-bold text-white">{a}</h2><p className="mt-2 text-sm text-slate-400">Agente preparado para configuração de modelo, prompt, ferramentas e permissões.</p></Card>)}</section></>}
