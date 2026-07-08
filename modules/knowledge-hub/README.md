# Módulo: knowledge-hub

**Status: parcialmente implementado (PATCH_086).**

Já funciona de verdade (fora deste diretório por enquanto):
- Upload de arquivos (PDF, Word, TXT, Markdown) para um bucket privado do
  Supabase Storage, um por usuário.
- Extração de texto real dos formatos suportados.
- Busca de contexto por palavra-chave, consultada automaticamente pelo
  Chat IA e pela geração de documentos (Action Engine).
- Interface em `/dashboard/documents`.

Pendente para uma próxima etapa:
- Extrair a lógica de `lib/knowledge/server.ts` para viver dentro deste
  módulo, seguindo o padrão completo dos outros módulos implementados
  (memory, ai-router).
- Busca por significado (embeddings/vetorial), em vez de só palavra-chave.
- Suporte a mais formatos (Excel, PowerPoint, imagens com OCR).
