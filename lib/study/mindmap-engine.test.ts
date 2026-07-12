import { describe, it, expect } from 'vitest';
import { buildMindMapHtml } from './mindmap-engine';

describe('buildMindMapHtml', () => {
  it('monta um HTML completo com os dados embutidos', () => {
    const html = buildMindMapHtml({
      topic: 'Inconfidência Mineira',
      branches: [
        { label: 'Causas', children: [{ label: 'Derrama' }, { label: 'Impostos altos' }] },
        { label: 'Personagens', children: [{ label: 'Tiradentes' }] }
      ]
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Inconfidência Mineira');
    expect(html).toContain('Derrama');
    expect(html).toContain('MindMap.render');
    expect(html).toContain('html2canvas');
    expect(html).toContain('jspdf');
  });

  it('escapa aspas e caracteres especiais nos rótulos sem quebrar o JSON embutido', () => {
    const html = buildMindMapHtml({
      topic: 'Teste "com aspas" e `crases`',
      branches: [{ label: 'Ramo com "aspas" e \\ barra' }]
    });

    // Extrai o JSON passado para MindMap.render e confirma que continua válido
    const match = html.match(/MindMap\.render\("mm-mount", (.+?), \{/);
    expect(match).not.toBeNull();
    expect(() => JSON.parse(match![1])).not.toThrow();
  });
});
