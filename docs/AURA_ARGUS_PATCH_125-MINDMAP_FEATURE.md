# AURA_ARGUS_PATCH_125 — MINDMAP_FEATURE

## Objetivo
Adicionar mapa mental gerado por IA à Central de Estudos, sobre a
matéria que o aluno está estudando (ou "por demanda" para uso mais
livre), com download em HTML, PNG, JPEG e PDF — usando como base um
motor de mapa mental já pronto e funcionando (construído para o Hub
MQCT do Senai Bahia), fornecido por Paulo.

## ⚠️ Nota de processo
Este patch foi implementado mesmo depois de eu recomendar segurar novas
features até o beta terminar — decisão de Paulo, registrada aqui sem
repetir a ressalva em detalhe (já foi dita antes nesta sessão).

## O que o arquivo fornecido tinha, e o que precisou mudar
O motor original é sólido — renderização radial em SVG, pan/zoom,
expandir/recolher nós, tela cheia, animações — mas o formato de dados
que ele aceitava era **específico do currículo do Senai**
(`unidadesCurriculares`, `subfuncoes`, `conhecimentos`, `habilidades`,
`atitudes` — vocabulário de plano de curso técnico). Isso não serve para
"mapa mental sobre Inconfidência Mineira" ou qualquer assunto livre.

**O que foi mantido quase 100% igual:** toda a lógica de renderização,
layout radial, pan/zoom, animações, exportação em HTML.

**O que foi reescrito:** a construção da árvore (`_buildTree`), que
agora aceita um formato genérico e simples:
```json
{ "topic": "Nome do mapa", "branches": [{ "label": "Ramo", "children": [{ "label": "Sub-item" }] }] }
```
Testado isoladamente antes de integrar (profundidade de 3 níveis, cores
por ramo, IDs únicos) — confirmado funcionando com um exemplo real
("Inconfidência Mineira") antes de considerar pronto.

## O que foi adicionado (não existia no arquivo original)
O original só tinha exportação em **HTML**. Adicionei:
- **PNG** e **JPEG** — captura visual do mapa (expandido e centralizado)
  via `html2canvas`, carregado por CDN só quando o mapa é aberto.
- **PDF** — mesma captura, embutida numa página PDF via `jsPDF`.

A exportação em HTML também foi corrigida: o original buscava
`mindmap.css`/`mindmap.js` de um servidor externo (`MM_BASE`, específico
do Hub do Senai) — nesta versão, tudo já vem embutido no próprio HTML
gerado, funciona 100% offline sem depender de nenhum servidor externo.

## Como funciona agora
1. Na Central de Estudos, digitar a matéria/assunto (o mesmo campo já
   usado pelo Foco e pelos jogos).
2. Clicar "🧠 Mapa Mental".
3. A IA gera a estrutura (4-7 ramos principais, com sub-itens, até 3
   níveis de profundidade).
4. O mapa aparece interativo, dentro de um `iframe` isolado (proteção:
   o motor roda separado do resto da aplicação, sem risco de conflito
   de estilo/script).
5. Botões dentro do próprio mapa: Expandir tudo, Recolher tudo, Zoom,
   Tela cheia, e as 4 exportações (HTML, PNG, JPEG, PDF).

## Arquivos novos
- `lib/study/mindmap-engine.ts` (motor adaptado + montagem do HTML)
- `lib/study/mindmap-engine.test.ts`
- `app/api/study/mindmap/route.ts`
- `components/study/mindmap-viewer.tsx`

## Arquivos alterados
- `lib/study/generation.ts` (`generateMindMap`)
- `app/dashboard/estudos/page.tsx` (botão "🧠 Mapa Mental")
- `app/globals.css` (estilo do iframe, aditivo)

## O que NÃO foi alterado
- Foco, Jogo do Milhão, Forca, Caça-palavras — inalterados.
- Nenhuma diferenciação por plano (Estudantil/Worker/Plus) ainda — como
  todo o resto da Central de Estudos, está acessível a qualquer conta
  por enquanto.

## Validação executada
```
npm run typecheck   # 0 erros
npm run test           # 30 testes, todos passando (2 novos)
npm run build           # build completo — /dashboard/estudos (12.1 kB,
                          cresceu porque o motor inteiro vai embutido) e
                          /api/study/mindmap compilaram
```
Lógica de construção da árvore testada isoladamente com Node antes de
integrar (profundidade, cores, unicidade de IDs).

## ⚠️ Limitações honestas
1. Não testei a geração real via IA neste ambiente, nem a exportação
   PNG/JPEG/PDF ao vivo (dependem de navegador real com `html2canvas`/
   `jsPDF` carregados por CDN — não consigo simular isso aqui).
2. A captura de imagem (PNG/JPEG/PDF) expande todos os nós antes de
   capturar — em assuntos com muitos ramos/sub-itens, a imagem final
   pode ficar bem grande/densa.
3. `html2canvas` e `jsPDF` são carregados via CDN só quando o mapa é
   aberto — exige internet ativa no momento do download dessas 3
   opções (o HTML puro funciona sempre, mesmo offline, porque não
   depende dessas bibliotecas).

## Teste funcional recomendado
1. Subir todos os arquivos.
2. Central de Estudos → digitar um assunto → 🧠 Mapa Mental.
3. Testar expandir/recolher, zoom, arrastar.
4. Testar as 4 exportações (HTML, PNG, JPEG, PDF) e confirmar que cada
   arquivo baixado abre corretamente.

## Status
Implementado e validado por build/testes automatizados (incluindo a
lógica de construção da árvore, testada isoladamente). Geração via IA e
exportação de imagem/PDF dependem de teste ao vivo em navegador real.
