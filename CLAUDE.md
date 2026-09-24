# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este repositório

Landing page estática (HTML/CSS/JS puro, sem framework, sem bundler) para a Itamaraty Estética Automotiva, um estúdio de detalhamento automotivo em Campinas/SP. O conteúdo institucional (serviços, contato, diferenciais) está resumido em [llms.txt](llms.txt). Site em português (pt-BR), publicado no GitHub Pages via [.github/workflows/](.github/workflows/) a cada push em `main`.

## Comandos

O site em si não tem build step, linter ou suíte de testes — é servido diretamente como arquivos estáticos. Existe um [package.json](package.json), mas só para a dependência do `sharp` usada no script de conversão de imagens (`npm install` uma vez antes de rodá-lo).

- **Servir localmente**: `npx serve` na raiz do repo (ou o servidor configurado em [.claude/launch.json](.claude/launch.json)). As regras de cache em [serve.json](serve.json) (formato do `serve`) valem só se o host de deploy as respeitar.
- **Preparar fotos de serviço**: `node scripts/prepare-service-images.mjs` — converte para `.webp` qualquer imagem não-webp dentro de `assets/images/services/<slug>/` e apaga o arquivo original. Rodar antes de gerar as páginas, sempre que fotos novas forem adicionadas.
- **Regenerar páginas de serviço**: `node scripts/generate-services.mjs` — sobrescreve todos os arquivos em `servicos/*.html` a partir do array `SERVICES` hardcoded em [scripts/generate-services.mjs](scripts/generate-services.mjs). Rodar de novo sempre que o conteúdo de um serviço mudar (nome, etapas, tagline) ou que fotos novas tenham sido preparadas.
- **Regenerar depoimentos**: `node scripts/generate-testimonials.mjs` — lê [data/reviews.js](data/reviews.js) e injeta o HTML gerado em [index.html](index.html) entre os marcadores `<!-- REVIEWS:START -->` / `<!-- REVIEWS:END -->`. Rodar de novo sempre que `data/reviews.js` mudar.

## Arquitetura

**Página inicial** ([index.html](index.html)) é a landing completa (hero, serviços, diferenciais, processo, stats, depoimentos, FAQ, CTA final) — todas as seções em fluxo normal de scroll (`.scroll-section`), sem nenhum bloco "sticky"/pinado. **Páginas de serviço** individuais ficam em `servicos/*.html`, uma por serviço (ex: `lavagem-tecnica.html`, `motor.html`, `chassi.html`), e são 100% geradas — não editar essas páginas diretamente, editar o array `SERVICES` em [scripts/generate-services.mjs](scripts/generate-services.mjs) e regenerar. Cada página de serviço referencia assets com caminho relativo `../` (elas vivem um nível abaixo da raiz).

**Fotos reais de serviço são auto-descobertas**: `generate-services.mjs` varre `assets/images/services/<slug>/` procurando pares `<CÓDIGO>-01.webp`/`<CÓDIGO>-02.webp` (01 = depois, 02 = antes; `<CÓDIGO>` é livre, ex: `AA`, `AB`...) para a seção de comparação antes/depois, e `OTHERS-XX.webp` para a galeria final (que também recebe o "depois" de cada par). Se a pasta do serviço não existir ou estiver vazia, cai automaticamente num placeholder genérico — nenhuma página quebra por falta de foto.

**Web Components nativos** (Custom Elements, sem framework) em `components/*.js`, usados tanto em `index.html` quanto nas páginas de serviço geradas:
- `before-after-slider` — slider de comparação antes/depois de imagens.
- `image-modal` — modal de imagem em tela cheia, disparado pelos `.gallery-tile` das galerias.
- `review-slider` — carrossel de depoimentos (light DOM, populado pelo script de geração de testemunhos).
- `seo-tags-modal` — modal com listas de tags de SEO exibido no rodapé.

**CSS**: [css/variables.css](css/variables.css) define os tokens (cores, fontes) usados por [css/index.css](css/index.css) (estilos da landing) e [css/services.css](css/services.css) (estilos específicos das páginas de serviço, carregado depois de `index.css`). Cor principal é amarelo (`--primary`/`--primary-bright`, não mexer no nome sem atualizar os Web Components, que leem essas variáveis via Shadow DOM com fallback hardcoded). Tipografia: `--font-display` (Bebas Neue, só títulos de impacto e headings — sempre peso 400, a fonte não tem outros pesos) e `--font-body`/`--font-accent` (Montserrat).

**JS de página**: [js/app.js](js/app.js) roda na landing (`index.html`); [js/service.js](js/service.js) roda nas páginas de serviço. Ambos assumem GSAP + ScrollTrigger + Lenis carregados via CDN (`<script>` tags no `<head>`/fim do `<body>`, não há import local desses pacotes). Em `app.js`, `initSectionAnimations()` anima cada `.scroll-section` uma única vez ao entrar na viewport (`ScrollTrigger` com `once: true`) — a seção não refaz a animação nem some ao rolar de volta para cima.

**Hero**: fundo é uma foto estática (`assets/images/hero-bg.webp`) com gradiente escurecedor para legibilidade (mesma técnica usada no hero das páginas de serviço). Não há mais vídeo com scroll nem canvas — esse sistema (extração de frames, pré-carregamento em lote, loader de progresso) foi removido inteiramente. Logo depois da hero fica `#particles-bg`, uma camada de partículas `position: fixed` (config em `assets/particles.json` para a do hero e `assets/particles-bg.json` para essa) que permanece parada atrás do conteúdo enquanto a página rola.

**Dados**: `data/reviews.js` exporta `REVIEWS`, consumido só pelo script de geração — não é importado em runtime pelo navegador.

**SEO/AI**: [llms.txt](llms.txt) e o JSON-LD embutido em cada página (`@graph` com `Service`/`BreadcrumbList` nas páginas de serviço) são a fonte de dados estruturados. Ambos, junto com [sitemap.xml](sitemap.xml) e [robots.txt](robots.txt), usam o placeholder `SEU-DOMINIO.com.br` que precisa virar o domínio real antes de publicar — ver [todo.md](todo.md) para a lista completa de pendências antes do lançamento (domínio, CNPJ, links de verificação externa, etc).

## Convenções

- Contato/agendamento em todo o site é via link `wa.me` (WhatsApp), número `5519993097721` hardcoded tanto em `index.html` quanto em `scripts/generate-services.mjs` — se o número mudar, atualizar nos dois lugares.
- Imagens ficam em `assets/images/` (fotos de conteúdo em `.webp`; converter com `scripts/prepare-service-images.mjs` ou manualmente via `sharp` antes de referenciar); fotos de cada serviço em `assets/images/services/<slug>/` (ver seção Arquitetura). `assets/videos/` é ignorado pelo git e não é mais usado pelo site (sobra do antigo vídeo com scroll).
- Ao adicionar/alterar um serviço: editar o array `SERVICES` em `scripts/generate-services.mjs`, rodar o script, e conferir se `index.html` (grid de serviços, JSON-LD `hasOfferCatalog`, lista de tags de SEO do rodapé) também referencia o novo slug/nome.
- Rodapé tem um crédito fixo ("Feito por ... Vinicius", link para `https://github.com/ViniDevBR`) duplicado em `index.html` e no template de `generate-services.mjs` — mudar nos dois lugares se precisar.
