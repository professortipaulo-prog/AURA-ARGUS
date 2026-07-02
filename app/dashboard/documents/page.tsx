import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/ui/empty-state';
export default function Page(){return <><Header title="Documentos" subtitle="Upload, download, conversão e geração de arquivos."/><section className="p-5 lg:p-8"><EmptyState title="Central de documentos preparada" description="Aqui entrarão PDF, Word, Excel, PowerPoint, imagens, SVG, JS, TS e documentos conectados ao Drive, OneDrive e NotebookLM." action="Criar projeto" href="/dashboard/projects"/></section></>}
