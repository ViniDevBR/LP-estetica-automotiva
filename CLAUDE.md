# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este repositório

Landing page estática (HTML/CSS/JS puro, sem framework, sem bundler) para a Itamaraty Estética Automotiva, um estúdio de detalhamento automotivo em Campinas/SP. O conteúdo institucional (serviços, contato, diferenciais) está resumido em [llms.txt](llms.txt). Site em português (pt-BR), publicado no GitHub Pages via [.github/workflows/](.github/workflows/) a cada push em `main`.

## Comandos

Não há `package.json`, gerenciador de pacotes, build step, linter ou suíte de testes. O site é servido diretamente como arquivos estáticos.

- **Servir localmente**: qualquer servidor estático simples (ex: `npx serve`) na raiz do repo. As regras de cache em [serve.json](serve.json) (formato do `serve`) valem só se o host de deploy as respeitar.
- **Regenerar páginas de serviço**: `node scripts/generate-services.mjs` — sobrescreve todos os arquivos em `servicos/*.html` a partir do array `SERVICES` hardcoded em [scripts/generate-services.mjs](scripts/generate-services.mjs). Rodar de novo sempre que o conteúdo de um serviço mudar.
- **Regenerar depoimentos**: `node scripts/generate-testimonials.mjs` — lê [data/reviews.js](data/reviews.js) e injeta o HTML gerado em [index.html](index.html) entre os marcadores `<!-- REVIEWS:START -->` / `<!-- REVIEWS:END -->`. Rodar de novo sempre que `data/reviews.js` mudar.

## Arquitetura

**Página inicial** ([index.html](index.html)) é a landing completa (hero, serviços, diferenciais, processo, depoimentos, FAQ). **Páginas de serviço** individuais ficam em `servicos/*.html`, uma por serviço (ex: `lavagem-tecnica.html`), e são 100% geradas — não editar essas páginas diretamente, editar o array `SERVICES` em [scripts/generate-services.mjs](scripts/generate-services.mjs) e regenerar. Cada página de serviço referencia assets com caminho relativo `../` (elas vivem um nível abaixo da raiz).

**Web Components nativos** (Custom Elements, sem framework) em `components/*.js`, usados tanto em `index.html` quanto nas páginas de serviço geradas:
- `before-after-slider` — slider de comparação antes/depois de imagens.
- `image-modal` — modal de imagem em tela cheia, disparado pelos `.gallery-tile` das galerias.
- `review-slider` — carrossel de depoimentos (light DOM, populado pelo script de geração de testemunhos).
- `seo-tags-modal` — modal com listas de tags de SEO exibido no rodapé.

**CSS**: [css/variables.css](css/variables.css) define tokens (cores, espaçamento) usados por [css/index.css](css/index.css) (estilos da landing) e [css/services.css](css/services.css) (estilos específicos das páginas de serviço, carregado depois de `index.css`).

**JS de página**: [js/app.js](js/app.js) roda na landing (`index.html`); [js/service.js](js/service.js) roda nas páginas de serviço. Ambos assumem GSAP + ScrollTrigger + Lenis carregados via CDN (`<script>` tags no `<head>`/fim do `<body>`, não há import local desses pacotes).

**Dados**: `data/reviews.js` exporta `REVIEWS`, consumido só pelo script de geração — não é importado em runtime pelo navegador.

**SEO/AI**: [llms.txt](llms.txt) e o JSON-LD embutido em cada página (`@graph` com `Service`/`BreadcrumbList` nas páginas de serviço) são a fonte de dados estruturados. Ambos, junto com [sitemap.xml](sitemap.xml) e [robots.txt](robots.txt), usam o placeholder `SEU-DOMINIO.com.br` que precisa virar o domínio real antes de publicar — ver [todo.md](todo.md) para a lista completa de pendências antes do lançamento (domínio, CNPJ, links de verificação externa, etc).

## Convenções

- Contato/agendamento em todo o site é via link `wa.me` (WhatsApp), número `5519993097721` hardcoded tanto em `index.html` quanto em `scripts/generate-services.mjs` — se o número mudar, atualizar nos dois lugares.
- Imagens ficam em `assets/images/`; vídeos em `assets/videos/` (ignorado pelo git, ver [.gitignore](.gitignore)); `frames/` contém uma sequência de `.webp` usada para animação por scroll.
- Ao adicionar/alterar um serviço: editar o array `SERVICES` em `scripts/generate-services.mjs`, rodar o script, e conferir se `index.html` (seção de serviços/menu) também referencia o novo slug.
