# Vídeo demonstrativo do Guia Digital

Peça de 33 segundos que mostra a jornada do guia, usada no botão "Em breve" da
página do produto digital. Projeto separado do site de propósito: as dependências
do Remotion não entram no build da Vercel.

## Como refazer

```bash
npm run build && PORT=3390 npm run start   # na raiz, noutro terminal
node video/capturar.mjs 3390               # refotografa as telas do guia
cd video && npm install && npm run render  # gera public/video/guia-demo.mp4
```

O `capturar.mjs` fotografa o app rodando, com o catálogo de verdade. Duas
particularidades do ambiente estão resolvidas dentro dele: o navegador daqui não
sai para a internet (as fotos do Storage são baixadas com curl e servidas por
interceptação de rota) e a curadoria com preço está na variação Menina.

## O que editar

- Texto das legendas e ordem das cenas: `src/Demo.tsx`, na lista `CENAS`.
- Ritmo: `DURACAO_CENA` (105 quadros, 3,5 s por tela a 30 fps).
- As telas em si: `public/telas/*.jpg`, refeitas pelo `capturar.mjs`.

## Quando o guia abrir

O vídeo diz "Em breve" no fecho. Ao abrir o acesso, troque a última cena em
`src/Demo.tsx`, renderize de novo e devolva o botão "Entrar no guia" em
`src/app/produto-digital/page.tsx`.
