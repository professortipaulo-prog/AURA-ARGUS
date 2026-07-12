/**
 * Motor de Mapa Mental — adaptado de um motor original construído para o
 * Hub MQCT (Senai Bahia), fornecido por Paulo. A renderização (SVG radial,
 * pan/zoom, expandir/recolher, exportação) foi mantida quase inteiramente;
 * a parte de construção da árvore foi generalizada para aceitar qualquer
 * assunto (o original só aceitava o formato específico do currículo do
 * Senai — Unidades Curriculares, Capacidades, Conhecimentos etc.).
 *
 * Exportações adicionadas nesta adaptação: PNG, JPEG e PDF (o original só
 * tinha HTML). Usa html2canvas + jsPDF via CDN, carregados só quando o
 * mapa é exibido.
 */

export const MINDMAP_CSS = `/* ============================================================
   MINDMAP.CSS — Motor de Mapa Mental Interativo (v2)
   Hub MQCT · SENAI Bahia
   Todas as classes são prefixadas com "mm-" e escopadas dentro
   de .mm-widget para não colidir com o tema (--cor, --bg, --text
   etc.) de cada página de área.
   ============================================================ */

.mm-widget {
  --mm-bg1: #0d0c16;
  --mm-bg2: #1b1530;
  --mm-glass: rgba(255, 255, 255, .06);
  --mm-glass-bd: rgba(255, 255, 255, .12);
  --mm-text: #f3f1fa;
  --mm-text-dim: #b9b3cf;
  --mm-accent: #ffd278; /* sobrescrito via JS com a --cor da área */

  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 14px;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 30%, var(--mm-bg2) 0%, var(--mm-bg1) 70%);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
.mm-widget * { box-sizing: border-box; }

/* Modo tela cheia nativo (Fullscreen API) */
.mm-widget:fullscreen,
.mm-widget:-webkit-full-screen {
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
}

/* ---------- Toolbar ---------- */
.mm-toolbar {
  position: absolute; top: 0; left: 0; right: 0; z-index: 20;
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(13, 12, 22, .55);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--mm-glass-bd);
}
.mm-title {
  font-size: 14px; margin: 0; color: var(--mm-text); font-weight: 700;
  white-space: nowrap; max-width: 280px; overflow: hidden; text-overflow: ellipsis;
}
.mm-sub { font-size: 11px; color: var(--mm-text-dim); margin-right: auto; white-space: nowrap; }
.mm-sep { width: 1px; align-self: stretch; background: var(--mm-glass-bd); margin: 0 2px; }
.mm-btn {
  background: var(--mm-glass); border: 1px solid var(--mm-glass-bd); color: var(--mm-text);
  padding: 6px 11px; border-radius: 9px; font-size: 12px; cursor: pointer;
  transition: .2s; white-space: nowrap; font-family: inherit;
}
.mm-btn:hover { background: rgba(255, 255, 255, .14); transform: translateY(-1px); }
.mm-btn:disabled { opacity: .5; cursor: default; transform: none; }
.mm-btn-accent {
  background: rgba(255, 210, 120, .18);
  border-color: rgba(255, 210, 120, .55);
  background: color-mix(in srgb, var(--mm-accent) 18%, transparent);
  border-color: color-mix(in srgb, var(--mm-accent) 55%, transparent);
  font-weight: 600;
}
.mm-btn-accent:hover {
  background: rgba(255, 210, 120, .3);
  background: color-mix(in srgb, var(--mm-accent) 30%, transparent);
}

/* ---------- Legend ---------- */
.mm-legend {
  position: absolute; top: 58px; right: 12px; z-index: 15;
  background: rgba(13, 12, 22, .55); backdrop-filter: blur(10px);
  border: 1px solid var(--mm-glass-bd); border-radius: 12px; padding: 9px 11px;
  max-width: 180px; font-size: 11px; color: var(--mm-text-dim);
}
.mm-legend h3 { margin: 0 0 6px; font-size: 11px; color: var(--mm-text); text-transform: uppercase; letter-spacing: .05em; }
.mm-legend-row { display: flex; align-items: center; gap: 7px; margin: 4px 0; }
.mm-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; box-shadow: 0 0 6px currentColor; }

/* ---------- Stage / World ---------- */
.mm-stage { position: absolute; inset: 0; overflow: hidden; cursor: grab; }
.mm-stage.mm-grabbing { cursor: grabbing; }
.mm-world {
  position: absolute; top: 0; left: 0; width: 2000px; height: 2000px;
  transform-origin: 0 0; will-change: transform;
}
.mm-edges-svg { position: absolute; top: 0; left: 0; width: 2000px; height: 2000px; pointer-events: none; overflow: visible; }

/* ---------- Nodes ---------- */
.mm-node {
  position: absolute; transform: translate(-50%, -50%) scale(.4); opacity: 0;
  transition: left .45s cubic-bezier(.22,.9,.32,1), top .45s cubic-bezier(.22,.9,.32,1),
    opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  border-radius: 14px; padding: 9px 14px; font-weight: 600; color: #fff; text-align: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.35); cursor: default; user-select: none;
  line-height: 1.25; border: 1px solid rgba(255,255,255,.18);
}
.mm-node.mm-node-show { opacity: 1; transform: translate(-50%, -50%) scale(1); }
.mm-node.mm-node-exit { opacity: 0 !important; transform: translate(-50%, -50%) scale(.4) !important; }
.mm-node.mm-clickable { cursor: pointer; }
.mm-node.mm-clickable:hover { transform: translate(-50%, -50%) scale(1.07); box-shadow: 0 6px 22px rgba(0,0,0,.45); }

.mm-node.mm-depth-0 {
  font-size: 16px; padding: 15px 24px; border-radius: 18px;
  background: linear-gradient(135deg, #2a2447, #15122a);
  border: 1.5px solid var(--mm-accent);
  box-shadow: 0 0 0 1px rgba(255,210,120,.15), 0 0 30px rgba(255,210,120,.25);
  animation: mm-pulse 3.2s ease-in-out infinite;
}
@keyframes mm-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(255,210,120,.15), 0 0 22px rgba(255,210,120,.2); }
  50% { box-shadow: 0 0 0 1px rgba(255,210,120,.25), 0 0 38px rgba(255,210,120,.4); }
}

.mm-node.mm-depth-1 { font-size: 13px; max-width: 170px; text-shadow: 0 1px 3px rgba(0,0,0,.4); }
.mm-node.mm-type-subcategory { font-size: 12px; max-width: 130px; text-shadow: 0 1px 3px rgba(0,0,0,.4); }
.mm-node.mm-type-leaf {
  font-size: 10.5px; max-width: 150px; font-weight: 500;
  background: rgba(255,255,255,.08) !important; text-shadow: none;
  -webkit-line-clamp: 4; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
}

.mm-node .mm-ic { margin-right: 5px; }
.mm-node .mm-chev { float: right; opacity: .75; font-size: 10px; margin-left: 4px; transition: transform .25s; }
.mm-node.mm-expanded .mm-chev { transform: rotate(90deg); }

/* ---------- Hint ---------- */
.mm-hint {
  position: absolute; bottom: 10px; left: 10px; z-index: 15; font-size: 10.5px;
  color: var(--mm-text-dim); background: rgba(13,12,22,.5); backdrop-filter: blur(8px);
  padding: 6px 10px; border-radius: 9px; border: 1px solid var(--mm-glass-bd);
}

/* ---------- Responsivo (mobile) ---------- */
@media (max-width: 640px) {
  .mm-title { max-width: 140px; font-size: 12px; }
  .mm-sub { display: none; }
  .mm-sep { display: none; }
  .mm-legend { max-width: 130px; top: 52px; }
}

html,body{margin:0;height:100%;background:#0d0c16}#mm-mount{width:100vw;height:100vh}`;

export const MINDMAP_JS = `(function () {
  'use strict';

  var PALETTE = ['#FF6B6B', '#4ECDC4', '#A78BFA', '#FF9F45', '#2EC4B6',
                 '#F472B6', '#60A5FA', '#84CC16', '#FB923C', '#22D3EE'];

  function shade(hex, pct) {
    var f = parseInt(hex.slice(1), 16), t = pct < 0 ? 0 : 255, p = Math.abs(pct);
    var R = f >> 16, G = (f >> 8) & 255, B = f & 255;
    return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  var SHELL =
    '<div class="mm-toolbar">' +
      '<h1 class="mm-title"></h1>' +
      '<span class="mm-sub"></span>' +
      '<button type="button" class="mm-btn" data-act="expand">＋ Expandir tudo</button>' +
      '<button type="button" class="mm-btn" data-act="collapse">－ Recolher tudo</button>' +
      '<button type="button" class="mm-btn" data-act="zoomin">🔍+</button>' +
      '<button type="button" class="mm-btn" data-act="zoomout">🔍−</button>' +
      '<button type="button" class="mm-btn" data-act="reset">⟳ Resetar</button>' +
      '<span class="mm-sep"></span>' +
      '<button type="button" class="mm-btn mm-btn-accent" data-act="fullscreen">⛶ Tela cheia</button>' +
      '<button type="button" class="mm-btn mm-btn-accent" data-act="download-html">⬇ HTML</button>' +
      '<button type="button" class="mm-btn mm-btn-accent" data-act="download-png">⬇ PNG</button>' +
      '<button type="button" class="mm-btn mm-btn-accent" data-act="download-jpeg">⬇ JPEG</button>' +
      '<button type="button" class="mm-btn mm-btn-accent" data-act="download-pdf">⬇ PDF</button>' +
    '</div>' +
    '<div class="mm-legend"></div>' +
    '<div class="mm-stage">' +
      '<div class="mm-world">' +
        '<svg class="mm-edges-svg"><g class="mm-edges"></g></svg>' +
        '<div class="mm-nodes-layer"></div>' +
      '</div>' +
    '</div>' +
    '<div class="mm-hint">💡 Clique nos nós para expandir/recolher · arraste para mover · scroll para zoom</div>';

  function MindMapInstance(container) {
    this.container = container;
    this.idSeq = 0;
    this.treeRoot = null;
    this.visibleNodes = [];
    this.nodeEls = new Map();
    this.scale = 0.55; this.panX = 0; this.panY = 0;
    this.CENTER = 1000; this.RADII = [0, 210, 380, 540, 680];
    this.lastData = null; this.lastOpts = null;
    this._build();
  }

  MindMapInstance.prototype._build = function () {
    var self = this;
    this.container.classList.add('mm-widget');
    this.container.innerHTML = SHELL;
    this.stage = this.container.querySelector('.mm-stage');
    this.world = this.container.querySelector('.mm-world');
    this.edgesGroup = this.container.querySelector('.mm-edges');
    this.nodesLayer = this.container.querySelector('.mm-nodes-layer');
    this.legendEl = this.container.querySelector('.mm-legend');
    this.titleEl = this.container.querySelector('.mm-title');
    this.subEl = this.container.querySelector('.mm-sub');
    this.btnDownloadHtml = this.container.querySelector('[data-act="download-html"]');
    this.btnDownloadPng = this.container.querySelector('[data-act="download-png"]');
    this.btnDownloadJpeg = this.container.querySelector('[data-act="download-jpeg"]');
    this.btnDownloadPdf = this.container.querySelector('[data-act="download-pdf"]');

    this.container.querySelector('[data-act="expand"]').onclick = function () { self._expandAll(self.treeRoot); self._render(); };
    this.container.querySelector('[data-act="collapse"]').onclick = function () { self._collapseAll(self.treeRoot); self.treeRoot.expanded = true; self._render(); };
    this.container.querySelector('[data-act="zoomin"]').onclick = function () { self._zoomAtCenter(1.25); };
    this.container.querySelector('[data-act="zoomout"]').onclick = function () { self._zoomAtCenter(0.8); };
    this.container.querySelector('[data-act="reset"]').onclick = function () { self._centerView(); };
    this.container.querySelector('[data-act="fullscreen"]').onclick = function () { self._toggleFullscreen(); };
    this.btnDownloadHtml.onclick = function () { self._downloadStandalone(); };
    this.btnDownloadPng.onclick = function () { self._downloadImage('png'); };
    this.btnDownloadJpeg.onclick = function () { self._downloadImage('jpeg'); };
    this.btnDownloadPdf.onclick = function () { self._downloadPdf(); };

    document.addEventListener('fullscreenchange', function () {
      requestAnimationFrame(function () { self._centerView(); });
    });

    var dragging = false, sx = 0, sy = 0, spx = 0, spy = 0;
    this.stage.addEventListener('mousedown', function (e) {
      if (e.target.closest('.mm-node')) return;
      dragging = true; self.stage.classList.add('mm-grabbing');
      sx = e.clientX; sy = e.clientY; spx = self.panX; spy = self.panY;
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      self.panX = spx + (e.clientX - sx); self.panY = spy + (e.clientY - sy);
      self._applyTransform();
    });
    window.addEventListener('mouseup', function () { dragging = false; self.stage.classList.remove('mm-grabbing'); });

    this.stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      self._zoomAtPoint(e.clientX, e.clientY, e.deltaY < 0 ? 1.1 : 0.9);
    }, { passive: false });

    // Toque (mobile): pan de 1 dedo, pinch-zoom de 2 dedos.
    var touchMode = null, tsx = 0, tsy = 0, lastDist = 0;
    this.stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1 && !e.target.closest('.mm-node')) {
        touchMode = 'pan'; tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; spx = self.panX; spy = self.panY;
      } else if (e.touches.length === 2) {
        touchMode = 'pinch';
        lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      }
    }, { passive: true });
    this.stage.addEventListener('touchmove', function (e) {
      if (touchMode === 'pan' && e.touches.length === 1) {
        self.panX = spx + (e.touches[0].clientX - tsx); self.panY = spy + (e.touches[0].clientY - tsy);
        self._applyTransform();
      } else if (touchMode === 'pinch' && e.touches.length === 2) {
        var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastDist > 0) self._zoomAtCenter(dist / lastDist);
        lastDist = dist;
      }
    }, { passive: true });
    this.stage.addEventListener('touchend', function () { touchMode = null; });
  };

  MindMapInstance.prototype._toggleFullscreen = function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (this.container.requestFullscreen) this.container.requestFullscreen();
  };

  MindMapInstance.prototype._applyTransform = function () {
    this.world.style.transform = 'translate(' + this.panX + 'px,' + this.panY + 'px) scale(' + this.scale + ')';
  };
  MindMapInstance.prototype._centerView = function () {
    var r = this.stage.getBoundingClientRect();
    this.scale = 0.55;
    this.panX = r.width / 2 - this.CENTER * this.scale;
    this.panY = r.height / 2 - this.CENTER * this.scale;
    this._applyTransform();
  };
  MindMapInstance.prototype._zoomAtCenter = function (factor) {
    var r = this.stage.getBoundingClientRect();
    this._zoomAtPoint(r.left + r.width / 2, r.top + r.height / 2, factor);
  };
  MindMapInstance.prototype._zoomAtPoint = function (clientX, clientY, factor) {
    var r = this.stage.getBoundingClientRect();
    var cx = clientX - r.left, cy = clientY - r.top;
    var wx = (cx - this.panX) / this.scale, wy = (cy - this.panY) / this.scale;
    this.scale = Math.min(2.2, Math.max(0.15, this.scale * factor));
    this.panX = cx - wx * this.scale; this.panY = cy - wy * this.scale;
    this._applyTransform();
  };

  // ---------- Construção genérica da árvore (qualquer assunto) ----------
  // Formato esperado: { topic: "Nome do mapa", branches: [ { label, children: [ { label, children: [...] }, ... ] }, ... ] }
  MindMapInstance.prototype._buildNode = function (item, depth, color, parent) {
    var node = {
      id: 'n' + (this.idSeq++),
      label: (item && item.label) || '',
      type: depth === 0 ? 'root' : depth === 1 ? 'branch' : 'leaf',
      color: color,
      parent: parent,
      children: null,
      expanded: depth <= 1
    };
    var kids = (item && item.children) || [];
    if (kids.length) {
      node.children = [];
      var self = this;
      kids.forEach(function (childItem) {
        node.children.push(self._buildNode(childItem, depth + 1, color, node));
      });
    }
    return node;
  };

  MindMapInstance.prototype._buildTree = function (data) {
    this.idSeq = 0;
    var root = { id: 'n' + (this.idSeq++), label: data.topic || 'Mapa Mental', type: 'root', color: null, parent: null, children: [], expanded: true };
    var branches = data.branches || [];
    var self = this;
    branches.forEach(function (branch, i) {
      var color = PALETTE[i % PALETTE.length];
      var node = self._buildNode(branch, 1, color, root);
      root.children.push(node);
    });
    return root;
  };

  function iconFor(n) {
    if (n.type === 'root') return '🧠';
    if (n.type === 'branch') return '🔷';
    return '•';
  }

  MindMapInstance.prototype._computeWeights = function (node) {
    if (!node.expanded || !node.children || !node.children.length) { node._w = 1; return 1; }
    var w = 0, self = this;
    node.children.forEach((c) => { w += self._computeWeights(c); });
    node._w = Math.max(w, 1);
    return node._w;
  };

  MindMapInstance.prototype._layout = function (node, depth, angleCenter, angleSpan) {
    node.depth = depth;
    if (depth === 0) { node.x = this.CENTER; node.y = this.CENTER; }
    else {
      var rad = angleCenter * Math.PI / 180;
      var radius = this.RADII[Math.min(depth, this.RADII.length - 1)];
      node.x = this.CENTER + radius * Math.cos(rad);
      node.y = this.CENTER + radius * Math.sin(rad);
    }
    this.visibleNodes.push(node);
    if (node.expanded && node.children && node.children.length) {
      var total = 0;
      node.children.forEach((c) => { total += (c._w || 1); });
      total = total || 1;
      var cursor = angleCenter - angleSpan / 2;
      var self = this;
      node.children.forEach((child) => {
        var w = child._w || 1;
        var span = angleSpan * (w / total);
        var center = cursor + span / 2;
        self._layout(child, depth + 1, center, span);
        cursor += span;
      });
    }
  };

  MindMapInstance.prototype._drawCurve = function (x1, y1, x2, y2, depth, color) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = -dy / len, py = dx / len;
    var offset = Math.min(len * 0.22, 50);
    var mx = (x1 + x2) / 2 + px * offset, my = (y1 + y2) / 2 + py * offset;
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' Q ' + mx + ' ' + my + ' ' + x2 + ' ' + y2);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', depth === 1 ? '#ffffff55' : (color || '#888'));
    p.setAttribute('stroke-width', depth === 1 ? 3 : depth === 2 ? 2.2 : 1.6);
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('opacity', depth === 1 ? 0.55 : depth === 2 ? 0.65 : 0.55);
    return p;
  };

  MindMapInstance.prototype._renderEdges = function () {
    this.edgesGroup.innerHTML = '';
    var self = this;
    this.visibleNodes.forEach((n) => {
      if (!n.parent) return;
      var p = n.parent;
      var path = self._drawCurve(p.x, p.y, n.x, n.y, n.depth, n.depth > 1 ? n.color : null);
      self.edgesGroup.appendChild(path);
    });
  };

  MindMapInstance.prototype._createNodeEl = function (n) {
    var el = document.createElement('div');
    el.className = 'mm-node mm-depth-' + n.depth + ' mm-type-' + n.type;
    var hasChildren = n.children && n.children.length > 0;
    if (hasChildren) el.classList.add('mm-clickable');
    if (n.depth > 0) {
      var bg = n.color ? ('linear-gradient(135deg, ' + n.color + ', ' + shade(n.color, -0.28) + ')') : null;
      if (n.type !== 'leaf' && bg) el.style.background = bg;
      else if (n.type === 'leaf') el.style.borderColor = n.color + '66';
    }
    if (n.depth > 0) el.title = n.label;
    el.innerHTML = '<span class="mm-ic">' + iconFor(n) + '</span>' + esc(n.label) + (hasChildren ? '<span class="mm-chev">▶</span>' : '');
    if (hasChildren) {
      var self = this;
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        n.expanded = !n.expanded;
        self._render();
      });
    }
    return el;
  };

  MindMapInstance.prototype._renderNodes = function () {
    var visibleIds = new Set(this.visibleNodes.map((n) => n.id));
    for (var entry of this.nodeEls) {
      var id = entry[0], el = entry[1];
      if (!visibleIds.has(id)) {
        el.classList.add('mm-node-exit');
        (function (el2) { setTimeout(function () { el2.remove(); }, 260); })(el);
        this.nodeEls.delete(id);
      }
    }
    var self = this;
    this.visibleNodes.forEach((n) => {
      var el = self.nodeEls.get(n.id);
      if (!el) {
        el = self._createNodeEl(n);
        el.style.left = (n.parent ? n.parent.x : n.x) + 'px';
        el.style.top = (n.parent ? n.parent.y : n.y) + 'px';
        self.nodesLayer.appendChild(el);
        self.nodeEls.set(n.id, el);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.classList.add('mm-node-show');
            el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
          });
        });
      } else {
        el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
        el.classList.toggle('mm-expanded', !!n.expanded);
      }
    });
  };

  MindMapInstance.prototype._render = function () {
    this.visibleNodes = [];
    this._computeWeights(this.treeRoot);
    this._layout(this.treeRoot, 0, -90, 360);
    this._renderEdges();
    this._renderNodes();
  };

  MindMapInstance.prototype._renderLegend = function () {
    var branches = this.treeRoot.children;
    this.legendEl.innerHTML = '<h3>Legenda</h3>' + branches.map((b) =>
      '<div class="mm-legend-row"><span class="mm-legend-dot" style="background:' + (b.color || '#ffd278') + ';color:' + (b.color || '#ffd278') + '"></span>' + esc(b.label) + '</div>'
    ).join('');
  };

  MindMapInstance.prototype._expandAll = function (n) { if (n.children) { var self = this; n.children.forEach((c) => { c.expanded = true; self._expandAll(c); }); } };
  MindMapInstance.prototype._collapseAll = function (n) { if (n.children) { var self = this; n.children.forEach((c) => { c.expanded = false; self._collapseAll(c); }); } };

  MindMapInstance.prototype.renderData = function (data, opts) {
    opts = opts || {};
    this.lastData = data; this.lastOpts = opts;
    this.titleEl.textContent = '🧠 ' + (data.topic || 'Mapa Mental');
    this.subEl.textContent = opts.subtitle || '';
    if (opts.accent) { this.container.style.setProperty('--mm-accent', opts.accent); }
    this.nodeEls.forEach((el) => el.remove());
    this.nodeEls.clear();
    this.treeRoot = this._buildTree(data);
    this._centerView();
    this._render();
    this._renderLegend();
  };

  // ---------- Exportação: HTML autônomo (CSS+JS+dados embutidos, funciona offline) ----------
  MindMapInstance.prototype._downloadStandalone = function () {
    if (!this.lastData) return;
    var css = window.__MM_CSS__ || '';
    var js = window.__MM_JS__ || '';
    var dataJson = JSON.stringify(this.lastData);
    var optsJson = JSON.stringify(this.lastOpts || {});
    var title = esc(this.lastData.topic || 'Mapa Mental');
    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + title + ' — Mapa Mental</title><style>' + css +
      '\\nhtml,body{margin:0;height:100%;background:#0d0c16}#mm-mount{width:100vw;height:100vh}</style></head>' +
      '<body><div id="mm-mount"></div><script>' + js + '<' + '/script>' +
      '<script>MindMap.render("mm-mount", ' + dataJson + ', ' + optsJson + ');<' + '/script></body></html>';
    var blob = new Blob([html], { type: 'text/html' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = this._safeFileName() + '.html';
    document.body.appendChild(a); a.click(); a.remove();
  };

  MindMapInstance.prototype._safeFileName = function () {
    var base = (this.lastData && this.lastData.topic) || 'mapa_mental';
    return 'Mapa_Mental_' + base.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
  };

  // ---------- Exportação: PNG / JPEG (captura visual via html2canvas) ----------
  MindMapInstance.prototype._captureCanvas = function () {
    var self = this;
    this._expandAll(this.treeRoot);
    this._render();
    this._centerView();
    return new Promise(function (resolve) {
      setTimeout(function () {
        window.html2canvas(self.container, { backgroundColor: '#0d0c16', scale: 2 }).then(resolve);
      }, 500); // aguarda a animacao de expandir os nos terminar antes de capturar
    });
  };

  MindMapInstance.prototype._downloadImage = function (format) {
    var self = this;
    var btn = format === 'png' ? this.btnDownloadPng : this.btnDownloadJpeg;
    var prevTxt = btn.textContent;
    btn.disabled = true; btn.textContent = '⏳...';
    this._captureCanvas().then(function (canvas) {
      var mime = format === 'png' ? 'image/png' : 'image/jpeg';
      var a = document.createElement('a');
      a.href = canvas.toDataURL(mime, 0.95);
      a.download = self._safeFileName() + '.' + format;
      document.body.appendChild(a); a.click(); a.remove();
    }).catch(function (e) {
      console.error(e);
      alert('Não foi possível gerar a imagem. Tente novamente.');
    }).finally(function () {
      btn.disabled = false; btn.textContent = prevTxt;
    });
  };

  // ---------- Exportação: PDF (mesma captura, embutida numa página PDF via jsPDF) ----------
  MindMapInstance.prototype._downloadPdf = function () {
    var self = this;
    var btn = this.btnDownloadPdf;
    var prevTxt = btn.textContent;
    btn.disabled = true; btn.textContent = '⏳...';
    this._captureCanvas().then(function (canvas) {
      var jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      var imgData = canvas.toDataURL('image/jpeg', 0.95);
      var orientation = canvas.width >= canvas.height ? 'l' : 'p';
      var pdf = new jsPDFCtor({ orientation: orientation, unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(self._safeFileName() + '.pdf');
    }).catch(function (e) {
      console.error(e);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    }).finally(function () {
      btn.disabled = false; btn.textContent = prevTxt;
    });
  };

  var instances = new WeakMap();

  window.MindMap = {
    mount: function (containerId) {
      var el = document.getElementById(containerId);
      if (!el) { console.error('MindMap.mount: elemento não encontrado:', containerId); return null; }
      var inst = instances.get(el);
      if (!inst) { inst = new MindMapInstance(el); instances.set(el, inst); }
      return inst;
    },
    render: function (containerId, data, opts) {
      var inst = window.MindMap.mount(containerId);
      if (inst) inst.renderData(data, opts);
      return inst;
    }
  };
})();
`;

export type MindMapNode = {
  label: string;
  children?: MindMapNode[];
};

export type MindMapData = {
  topic: string;
  branches: MindMapNode[];
};

/**
 * Monta o HTML autônomo completo (CSS + motor + dados + libs de
 * exportação via CDN) — usado tanto para exibir o mapa num iframe quanto
 * como base do download em HTML.
 */
export function buildMindMapHtml(data: MindMapData, opts: { accent?: string; subtitle?: string } = {}): string {
  const dataJson = JSON.stringify(data);
  const optsJson = JSON.stringify(opts);
  const title = data.topic || 'Mapa Mental';

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Mapa Mental</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<style>${MINDMAP_CSS}
html,body{margin:0;height:100%;background:#0d0c16}#mm-mount{width:100vw;height:100vh}</style></head>
<body><div id="mm-mount"></div>
<script>window.__MM_CSS__ = ${JSON.stringify(MINDMAP_CSS)}; window.__MM_JS__ = ${JSON.stringify(MINDMAP_JS)};<\/script>
<script>${MINDMAP_JS}<\/script>
<script>MindMap.render("mm-mount", ${dataJson}, ${optsJson});<\/script>
</body></html>`;
}
