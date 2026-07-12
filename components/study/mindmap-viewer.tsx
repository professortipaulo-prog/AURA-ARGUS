'use client';

import { useMemo } from 'react';
import { buildMindMapHtml, type MindMapData } from '@/lib/study/mindmap-engine';

export function MindMapViewer({ data, accent, onExit }: { data: MindMapData; accent?: string; onExit: () => void }) {
  const html = useMemo(() => buildMindMapHtml(data, { accent, subtitle: 'Gerado por IA' }), [data, accent]);

  return (
    <div className="aios-mindmap-wrap">
      <iframe
        title={`Mapa mental — ${data.topic}`}
        srcDoc={html}
        className="aios-mindmap-frame"
        sandbox="allow-scripts allow-downloads allow-same-origin"
      />
      <div className="aios-action-bar" style={{ marginTop: 14 }}>
        <button className="aios-secondary-button" onClick={onExit}>Voltar</button>
      </div>
    </div>
  );
}
