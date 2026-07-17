# Quarto da Helô

Site do **Quarto da Helô** — estúdio criativo de arquitetura e curadoria assinada
para a primeira infância. Arquitetura, interiores, curadoria e produção, com bossa,
afeto e primor em cada detalhe.

## Como funciona

Site estático (HTML/CSS, sem build). O Vercel publica a `main` automaticamente.

- `index.html` — página principal (Quem somos · Como trabalhamos · Guia digital · Contato).
- `guia.html` — página "Coming soon" do Guia digital (destino do botão *Conhecer o guia*).
- `.vercelignore` — mantém os documentos de contexto/briefing fora do site público.

## Padrão Lex

Este projeto segue a esteira padrão dos sistemas: **repo (GitHub) → deploy (Vercel)
→ suporte (widget) → Engenheiro → aprovação**. O widget de suporte já está embutido
(`data-app="quartohelo"`), então qualquer pessoa relata um ajuste direto pela tela e
o chamado chega ao hub.

## Pendências de arte (trocar pelos arquivos da Helô)

- Foto de fundo do hero (`index.html`, bloco `.hero-bg` — ponto de troca marcado).
- Imagem de atmosfera ao lado do hero (`.portrait` — ponto de troca marcado).
- Fotos/identidade visual complementares quando disponíveis.

Enquanto os arquivos não chegam, o site usa uma composição tipográfica em tons da
marca — apresentável e sem imagem quebrada.
