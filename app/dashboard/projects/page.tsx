import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/ui/empty-state';
export default function Page(){return <><Header title="Projetos" subtitle="Organize contextos, tarefas e entregáveis."/><section className="p-5 lg:p-8"><EmptyState title="Nenhum projeto criado ainda" description="Os projetos serão usados para agrupar documentos, conversas, memória e entregáveis gerados pelo AURA/ARGUS." action="Abrir chat" href="/dashboard/chat"/></section></>}
