import { describe, it, expect } from 'vitest';
import { detectDocumentIntent } from './chat-document-intent';

describe('detectDocumentIntent', () => {
  it('reconhece pedido de documento Word (padrão)', () => {
    const result = detectDocumentIntent('crie um documento sobre a historia do Brasil');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('docx');
    expect(result?.topic).toContain('historia do Brasil');
  });

  it('reconhece pedido de PDF', () => {
    const result = detectDocumentIntent('gere um pdf sobre cibersegurança para iniciantes');
    expect(result?.format).toBe('pdf');
  });

  it('reconhece pedido de planilha (xlsx)', () => {
    const result = detectDocumentIntent('faça uma planilha com o orçamento do projeto');
    expect(result?.format).toBe('xlsx');
  });

  it('reconhece pedido de apresentação (pptx)', () => {
    const result = detectDocumentIntent('prepare uma apresentação sobre inteligência artificial');
    expect(result?.format).toBe('pptx');
  });

  it('não dispara em perguntas normais de conversa', () => {
    expect(detectDocumentIntent('qual a capital da França?')).toBeNull();
    expect(detectDocumentIntent('me explica o que é machine learning')).toBeNull();
  });
});
