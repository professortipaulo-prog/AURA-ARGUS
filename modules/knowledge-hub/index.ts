/**
 * modules/knowledge-hub/index.ts
 * Status: parcialmente implementado (PATCH_086). Upload de arquivos,
 * extracao de texto (PDF/DOCX/TXT/MD) e consulta por palavra-chave ja
 * funcionam de verdade, via lib/knowledge/server.ts, app/api/knowledge/*
 * e app/dashboard/documents/page.tsx -- ainda nao migrados para viver
 * fisicamente dentro deste modulo.
 */
export const MODULE_STATUS = 'partial' as const;
