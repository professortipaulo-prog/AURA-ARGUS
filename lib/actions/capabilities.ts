import type { ActionCapability } from './types';

export const ACTION_CAPABILITIES: ActionCapability[] = [
  {
    id: 'document.create',
    title: 'Gerar documento',
    description: 'Cria arquivos iniciais em Markdown, HTML, TXT, CSV, JSON, SVG e DOC compatível com Word.',
    provider: 'aura',
    status: 'active',
    formats: ['md', 'html', 'txt', 'csv', 'json', 'svg', 'doc']
  },
  {
    id: 'file.prepare_download',
    title: 'Preparar download',
    description: 'Entrega o artefato gerado em Base64/Data URL para download pelo navegador.',
    provider: 'system',
    status: 'active'
  },
  {
    id: 'tool.list_capabilities',
    title: 'Listar capacidades',
    description: 'Mostra as ferramentas disponíveis no Action Engine.',
    provider: 'system',
    status: 'active'
  },
  {
    id: 'google.drive.upload',
    title: 'Enviar ao Google Drive',
    description: 'Reservado para a próxima etapa de integração OAuth/Drive.',
    provider: 'argus',
    status: 'planned'
  },
  {
    id: 'gmail.send',
    title: 'Enviar por Gmail',
    description: 'Reservado para a próxima etapa de integração Gmail.',
    provider: 'argus',
    status: 'planned'
  },
  {
    id: 'notebooklm.link',
    title: 'Adicionar ao NotebookLM',
    description: 'Reservado para integração externa futura.',
    provider: 'argus',
    status: 'planned'
  }
];
