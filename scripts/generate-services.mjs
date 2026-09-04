// Gera as páginas estáticas em /servicos/*.html a partir de SERVICES.
// Rodar novamente sempre que o conteúdo dos serviços mudar (ex: quando
// fotos reais de antes/depois substituírem os placeholders).
//
//   node scripts/generate-services.mjs

import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'servicos');
const SVC_IMAGES_DIR = join(ROOT, 'assets', 'images', 'services');

const WHATSAPP_NUMBER = '5519993097721';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2308090b'/%3E%3Ctext x='32' y='42' font-family='Georgia,serif' font-size='30' fill='%236fa8ff' text-anchor='middle'%3EI%3C/text%3E%3C/svg%3E";

// Placeholders até termos fotos reais de antes/depois por serviço.
const PLACEHOLDER_BEFORE = '../assets/images/shot-detailer-inspection.webp';
const PLACEHOLDER_AFTER = '../assets/images/shot-hero-black-supercar.webp';

const SERVICES = [
  {
    slug: 'lavagem-tecnica',
    code: '01',
    name: 'Lavagem Técnica',
    eyebrow: 'Lavagem Técnica',
    heroWords: [['LAVAGEM'], ['TÉCNICA.']],
    tagline: 'Da pré-lavagem ao acabamento em vidros, rodas e pneus — um processo completo e cuidadoso, com atenção a cada canto do veículo, para o padrão de qualidade Itamaraty em cada detalhe.',
    metaDescription: 'Lavagem técnica automotiva em Campinas/SP: descontaminação com pH neutro e técnica de dois baldes, sem risco à pintura. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Pré-lavagem', desc: 'Remoção da sujeira pesada e preparação da superfície.' },
      { title: 'Lavagem técnica', desc: 'Limpeza cuidadosa da carroceria, rodas, caixas de roda e detalhes externos com produtos e técnicas adequadas.' },
      { title: 'Cantos e detalhes', desc: 'Atenção especial a emblemas, frisos, frestas, maçanetas e demais pontos de difícil acesso.' },
      { title: 'Enxágue e secagem', desc: 'Remoção completa dos resíduos e secagem cuidadosa para evitar marcas e riscos.' },
      { title: 'Acabamento', desc: 'Limpeza dos vidros, verniz de caixa de rodas e selante de pneus.' }
    ]
  },
  {
    slug: 'motor-chassi',
    code: '02',
    name: 'Motor e Chassi',
    eyebrow: 'Motor e Chassi',
    heroWords: [['MOTOR'], ['E', 'CHASSI.']],
    tagline: 'Limpeza segura do compartimento do motor e da parte inferior do veículo, protegendo componentes elétricos.',
    metaDescription: 'Lavagem técnica de motor e chassi em Campinas/SP, com proteção de componentes elétricos. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Proteção de componentes elétricos', desc: 'Sensores, chicotes e conectores sensíveis são isolados antes de qualquer produto entrar em contato.' },
      { title: 'Desengraxe dirigido', desc: 'Produto específico aplicado nos pontos de acúmulo de graxa e óleo do motor e da suspensão.' },
      { title: 'Enxágue de baixa pressão', desc: 'Remove resíduos sem forçar água para dentro de conectores e mancais.' },
      { title: 'Secagem e proteção', desc: 'Compartimento seco por completo antes da entrega, evitando oxidação.' }
    ]
  },
  {
    slug: 'higienizacao-interna',
    code: '03',
    name: 'Higienização Interna',
    eyebrow: 'Higienização Interna',
    heroWords: [['HIGIENIZAÇÃO'], ['INTERNA.']],
    tagline: 'Extração profunda de ácaros, odores e manchas em bancos, forração, teto e carpete.',
    metaDescription: 'Higienização interna automotiva em Campinas/SP: extração profunda de ácaros, odores e manchas. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Aspiração técnica', desc: 'Remove partículas soltas de bancos, carpete e frestas antes de qualquer produto líquido.' },
      { title: 'Pré-tratamento de manchas', desc: 'Produto específico conforme o tipo de tecido e a origem da mancha.' },
      { title: 'Extração profunda', desc: 'Máquina injeta e extrai simultaneamente, sem encharcar o estofado ou o forro.' },
      { title: 'Secagem e neutralização de odor', desc: 'Ambiente ventilado até a secagem completa, sem cheiro residual de produto.' }
    ]
  },
  {
    slug: 'protecao-pintura',
    code: '04',
    name: 'Proteção de Pintura',
    eyebrow: 'Proteção de Pintura',
    heroWords: [['PROTEÇÃO'], ['DE', 'PINTURA.']],
    tagline: 'Polimento, cristalização, vitrificação cerâmica e enceramento — protocolo definido pela espessura real de verniz medida antes de iniciar.',
    metaDescription: 'Polimento técnico e vitrificação cerâmica em Campinas/SP, com protocolo definido por medição real de espessura de verniz. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Medição da espessura de verniz', desc: 'Define, em micra, quanto de correção a pintura suporta com segurança.' },
      { title: 'Polimento corretivo', desc: 'Remove riscos e opacidade na medida exata necessária — nem mais, nem menos.' },
      { title: 'Descontaminação final', desc: 'Pintura limpa a nível molecular antes de qualquer produto de proteção.' },
      { title: 'Aplicação da proteção', desc: 'Cristalização ou vitrificação cerâmica, com cura controlada em ambiente livre de poeira.' }
    ]
  },
  {
    slug: 'restauracao-farol',
    code: '05',
    name: 'Restauração de Faróis',
    eyebrow: 'Restauração de Faróis',
    heroWords: [['RESTAURAÇÃO'], ['DE', 'FARÓIS.']],
    tagline: 'Remoção da oxidação amarelada do policarbonato com lixamento técnico e selagem.',
    metaDescription: 'Restauração de faróis automotivos em Campinas/SP: remoção de oxidação e selagem UV. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Avaliação do policarbonato', desc: 'O nível de oxidação define a granulometria inicial do lixamento.' },
      { title: 'Lixamento progressivo', desc: 'Remove a camada oxidada em etapas, sem gerar manchas ou marcas de disco.' },
      { title: 'Polimento óptico', desc: 'Devolve a transparência sem distorcer o feixe de luz do farol.' },
      { title: 'Selagem UV', desc: 'Protege contra nova oxidação por exposição solar.' }
    ]
  },
  {
    slug: 'restauracao-couro',
    code: '06',
    name: 'Restauração de Couro',
    eyebrow: 'Restauração de Couro',
    heroWords: [['RESTAURAÇÃO'], ['DE', 'COURO.']],
    tagline: 'Tratamento com linha Colortek Leather para rachaduras, desbotamento e ressecamento.',
    metaDescription: 'Restauração de bancos de couro em Campinas/SP com linha Colortek Leather. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Diagnóstico do couro', desc: 'Identifica se é rachadura, desbotamento ou ressecamento antes de definir o tratamento.' },
      { title: 'Limpeza profunda', desc: 'Remove óleos corporais e sujeira impregnada nos poros do couro.' },
      { title: 'Reparo e igualação de cor', desc: 'Preenchimento de rachaduras e correção de tom com produtos Colortek Leather.' },
      { title: 'Hidratação e selagem', desc: 'Devolve a flexibilidade e protege contra novo ressecamento.' }
    ]
  },
  {
    slug: 'servico-moto',
    code: '07',
    name: 'Serviços para Motos',
    eyebrow: 'Serviços para Motos',
    heroWords: [['SERVIÇOS'], ['PARA', 'MOTOS.']],
    tagline: 'Lavagem técnica, polimento e proteção adaptados à geometria e aos materiais específicos de motocicletas.',
    metaDescription: 'Lavagem técnica, polimento e proteção para motos em Campinas/SP. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Proteção de componentes sensíveis', desc: 'Corrente, escapamento e parte elétrica são isolados antes da lavagem.' },
      { title: 'Lavagem por peça', desc: 'Tanque, carenagem e partes cromadas lavados individualmente.' },
      { title: 'Polimento de cromados e pintura', desc: 'Técnica específica para as curvas e superfícies pequenas da moto.' },
      { title: 'Proteção final', desc: 'Cera ou selante adequado a cada tipo de superfície da motocicleta.' }
    ]
  },
  {
    slug: 'customizacao-bancos',
    code: '08',
    name: 'Customização de Bancos',
    eyebrow: 'Customização de Bancos',
    heroWords: [['CUSTOMIZAÇÃO'], ['DE', 'BANCOS.']],
    tagline: 'Substituição do revestimento original de tecido por couro sob medida, com costura personalizada.',
    metaDescription: 'Customização de bancos automotivos em Campinas/SP: troca de tecido por couro sob medida. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Molde sob medida', desc: 'Retirada do padrão exato de cada banco do veículo.' },
      { title: 'Corte e costura', desc: 'Couro cortado e costurado conforme o molde e o design escolhido.' },
      { title: 'Instalação', desc: 'Revestimento novo aplicado sobre a espuma original, sem folgas.' },
      { title: 'Acabamento final', desc: 'Ajustes de tensão e conferência de costura antes da entrega.' }
    ]
  }
];

const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

function heroHeadingHtml(words) {
  return words.map((line, i) => {
    const cls = i === words.length - 1 ? 'line accent' : 'line';
    const spans = line.map((w) => `<span class="word">${w}</span>`).join(' ');
    return `<span class="${cls}">${spans}</span>`;
  }).join('\n        ');
}

function stepsHtml(steps) {
  return steps.map((s, i) => `
          <li class="process-item"><span class="process-num">${i + 1}</span>
            <div>
              <h3>${s.title}</h3>
              <p>${s.desc}</p>
            </div>
          </li>`).join('');
}

// Pasta com fotos reais de um serviço: assets/images/services/<slug>/
// Convenção de nomes (já em .webp — ver scripts/prepare-service-images.mjs):
//   <CÓDIGO>-01.webp / <CÓDIGO>-02.webp   par antes/depois — 01 é a foto
//                                          da esquerda (DEPOIS), 02 a da
//                                          direita (ANTES). <CÓDIGO> é
//                                          qualquer prefixo (AA, AB, AC...)
//                                          que identifique o par.
//   OTHERS-01.webp, OTHERS-02.webp, ...   fotos avulsas, só para a grid.
// A grid final soma OTHERS-* com a foto "01" (depois) de cada par.
// Sem fotos na pasta ainda, cai no placeholder atual — nada quebra.
function scanServiceImages(slug) {
  const dir = join(SVC_IMAGES_DIR, slug);
  if (!existsSync(dir)) return { pairs: [], others: [] };

  const re = /^(.+)-(\d+)\.webp$/i;
  const groups = new Map();
  const others = [];

  for (const file of readdirSync(dir)) {
    const m = file.match(re);
    if (!m) continue;
    const [, prefix, num] = m;
    if (/^others$/i.test(prefix)) {
      others.push(file);
      continue;
    }
    if (!groups.has(prefix)) groups.set(prefix, {});
    groups.get(prefix)[num] = file;
  }

  const pairs = [];
  for (const [prefix, byNum] of groups) {
    if (byNum['01'] && byNum['02']) {
      pairs.push({ prefix, depois: byNum['01'], antes: byNum['02'] });
    }
  }
  pairs.sort((a, b) => a.prefix.localeCompare(b.prefix));
  others.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return { pairs, others };
}

function resultsCaption(svc) {
  const { pairs } = scanServiceImages(svc.slug);
  return pairs.length
    ? 'Arraste a linha para revelar o antes e o depois de trabalhos reais deste serviço.'
    : 'Exemplos ilustrativos do padrão de acabamento buscado neste serviço — arraste a linha para revelar o antes e o depois. <em>(Fotos reais deste serviço em breve.)</em>';
}

function galleryHtml(svc) {
  const { pairs } = scanServiceImages(svc.slug);

  if (!pairs.length) {
    let out = '';
    for (let i = 1; i <= 10; i++) {
      out += `
          <figure class="svc-gallery-item">
            <before-after-slider before="${PLACEHOLDER_BEFORE}" after="${PLACEHOLDER_AFTER}"
              alt="${svc.name} — exemplo ${i}"></before-after-slider>
            <figcaption class="svc-gallery-caption">Exemplo 0${i}</figcaption>
          </figure>`;
    }
    return out;
  }

  let out = '';
  pairs.forEach((p, i) => {
    const num = i + 1;
    const beforeSrc = `../assets/images/services/${svc.slug}/${p.antes}`;
    const afterSrc = `../assets/images/services/${svc.slug}/${p.depois}`;
    out += `
          <figure class="svc-gallery-item">
            <before-after-slider before="${beforeSrc}" after="${afterSrc}"
              alt="${svc.name} — exemplo ${num}"></before-after-slider>
            <figcaption class="svc-gallery-caption">Exemplo ${String(num).padStart(2, '0')}</figcaption>
          </figure>`;
  });
  return out;
}

function gridHtml(svc) {
  const { pairs, others } = scanServiceImages(svc.slug);
  const gridFiles = [...others, ...pairs.map((p) => p.depois)];

  if (!gridFiles.length) {
    const pool = [
      { src: `../assets/images/svc-${svc.slug}.webp`, alt: `${svc.name} — detalhe` },
      { src: PLACEHOLDER_AFTER, alt: `${svc.name} — resultado` },
      { src: PLACEHOLDER_BEFORE, alt: `${svc.name} — processo` }
    ];
    let out = '';
    for (let i = 0; i < 12; i++) {
      const p = pool[i % pool.length];
      out += `
        <button class="gallery-tile" data-src="${p.src}" data-caption="${p.alt}">
          <img src="${p.src}" alt="${p.alt}" loading="lazy">
        </button>`;
    }
    return out;
  }

  let out = '';
  gridFiles.forEach((file, i) => {
    const src = `../assets/images/services/${svc.slug}/${file}`;
    const alt = `${svc.name} — detalhe ${i + 1}`;
    out += `
        <button class="gallery-tile" data-src="${src}" data-caption="${alt}">
          <img src="${src}" alt="${alt}" loading="lazy">
        </button>`;
  });
  return out;
}

function jsonLd(svc) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: svc.name,
        description: svc.tagline,
        provider: { '@id': 'https://SEU-DOMINIO.com.br/#business' },
        areaServed: 'Campinas e região',
        url: `https://SEU-DOMINIO.com.br/servicos/${svc.slug}.html`
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://SEU-DOMINIO.com.br/' },
          { '@type': 'ListItem', position: 2, name: 'Serviços', item: 'https://SEU-DOMINIO.com.br/#servicos' },
          { '@type': 'ListItem', position: 3, name: svc.name, item: `https://SEU-DOMINIO.com.br/servicos/${svc.slug}.html` }
        ]
      }
    ]
  }, null, 2);
}

function renderPage(svc) {
  const waHero = waLink(`Olá! Vim pelo site e gostaria de saber mais sobre o serviço de ${svc.name}.`);
  const waCta = waLink(`Olá! Vim pelo site e gostaria de agendar uma avaliação para ${svc.name}.`);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${svc.name} | Itamaraty Estética Automotiva</title>
<meta name="description" content="${svc.metaDescription}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://SEU-DOMINIO.com.br/servicos/${svc.slug}.html">

<meta property="og:type" content="website">
<meta property="og:title" content="${svc.name} | Itamaraty Estética Automotiva">
<meta property="og:description" content="${svc.metaDescription}">
<meta property="og:image" content="../assets/images/svc-${svc.slug}.webp">
<meta property="og:url" content="https://SEU-DOMINIO.com.br/servicos/${svc.slug}.html">
<meta property="og:locale" content="pt_BR">

<link rel="icon" href="${FAVICON}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="../css/variables.css">
<link rel="stylesheet" href="../css/index.css">
<link rel="stylesheet" href="../css/services.css">

<script type="application/ld+json">
${jsonLd(svc)}
</script>
</head>
<body class="service-page">

<a href="../index.html" class="service-back">
  <img src="../assets/images/logo.webp" alt="Itamaraty Estética Automotiva" width="900" height="245">
  <span>Voltar</span>
</a>

<section class="service-hero"
  style="background-image: linear-gradient(180deg, rgba(8,9,11,0.35) 0%, rgba(8,9,11,0.82) 70%, var(--void) 100%), url('../assets/images/svc-${svc.slug}.webp');">
  <div class="service-hero-inner">
    <span class="section-label">Itamaraty — ${svc.eyebrow}</span>
    <h1 class="service-hero-heading">
        ${heroHeadingHtml(svc.heroWords)}
    </h1>
    <p class="service-hero-tagline">${svc.tagline}</p>
    <div class="service-hero-ctas">
      <a href="${waHero}" class="btn btn-primary" target="_blank" rel="noopener">Falar com Especialista</a>
      <a href="#etapas" class="btn btn-secondary">Ver etapas</a>
    </div>
  </div>
  <div class="scroll-indicator" aria-hidden="true">
    <span>Role para explorar</span>
    <div class="scroll-arrow"></div>
  </div>
</section>

<section class="svc-section svc-steps" id="etapas">
  <div class="svc-section-head">
    <span class="section-label">Como funciona</span>
    <h2 class="svc-section-heading">Etapas do serviço</h2>
  </div>
  <ol class="process-list">${stepsHtml(svc.steps)}
  </ol>
</section>

<section class="svc-section svc-gallery" id="resultados">
  <div class="svc-section-head">
    <span class="section-label">Resultados</span>
    <h2 class="svc-section-heading">Arraste para comparar</h2>
    <p class="svc-section-body">${resultsCaption(svc)}</p>
  </div>
  <div class="svc-gallery-grid">${galleryHtml(svc)}
  </div>
</section>

<section class="svc-section svc-showcase" id="galeria">
  <div class="svc-section-head">
    <span class="section-label">Galeria</span>
    <h2 class="svc-section-heading">Mais detalhes do trabalho</h2>
  </div>
  <div class="svc-filter-bar">
    <span>Colunas:</span>
    <button class="svc-filter-btn" data-cols="2" aria-pressed="false">2</button>
    <button class="svc-filter-btn" data-cols="3" aria-pressed="false">3</button>
    <button class="svc-filter-btn" data-cols="4" aria-pressed="false">4</button>
    <button class="svc-filter-btn" data-cols="5" aria-pressed="false">5</button>
  </div>
  <div class="gallery-grid">${gridHtml(svc)}
  </div>
</section>

<section class="section-cta-final svc-cta" id="contato">
  <div class="section-inner section-inner-center">
    <span class="section-label">Próximo passo</span>
    <h2 class="cta-heading">Seu carro merece o padrão Itamaraty em ${svc.name.toLowerCase()}.</h2>
    <p class="section-note">Resposta rápida. Avaliação sem compromisso.</p>
    <a href="${waCta}" class="btn btn-primary btn-large cta-button" target="_blank" rel="noopener">Falar com Especialista</a>
  </div>
</section>

<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <img src="../assets/images/logo.webp" alt="Itamaraty Estética Automotiva" class="logo footer-logo" width="900" height="507" loading="lazy">
      <p>Detalhamento automotivo premium em Campinas/SP.</p>
    </div>
    <div class="footer-col">
      <h4>Contato</h4>
      <p class="footer-address">
        <svg class="icon-pin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
        <span>Av. Itamarati, 807 — Vila Aeroporto<br>Campinas/SP, 13054-150</span>
      </p>
      <p><a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">(19) 99309-7721</a></p>
      <p><a href="https://www.instagram.com/itamaraty_autoestetica" target="_blank" rel="noopener">@itamaraty_autoestetica</a></p>
      <div class="footer-social">
        <a href="https://www.instagram.com/itamaraty_autoestetica" target="_blank" rel="noopener" aria-label="Instagram Itamaraty Estética Automotiva">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>
        </a>
        <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener" aria-label="WhatsApp Itamaraty Estética Automotiva">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4 8.36 4 14.98c0 2.2.58 4.28 1.68 6.13L4 29l8.1-1.63a12.9 12.9 0 0 0 3.92.6h.01c6.62 0 12.02-5.36 12.02-11.98C28.05 8.36 22.64 3 16.02 3zm0 21.9h-.01a10 10 0 0 1-5.08-1.39l-.36-.21-3.8.76.8-3.7-.24-.38a9.9 9.9 0 0 1-1.53-5.3c0-5.47 4.46-9.92 9.94-9.92 2.65 0 5.14 1.04 7.02 2.92a9.86 9.86 0 0 1 2.91 7.02c0 5.47-4.46 9.92-9.65 9.92zm5.44-7.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
        </a>
        <a href="https://www.facebook.com/itamaratyesteticaautomotiva/?locale=pt_BR" target="_blank" rel="noopener" aria-label="Facebook Itamaraty Estética Automotiva">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.9h2.65l.4-3.08H13.5V8.04c0-.89.25-1.5 1.52-1.5h1.63V3.8C16.37 3.75 15.4 3.67 14.27 3.67c-2.34 0-3.95 1.43-3.95 4.05v2.3H7.66v3.08h2.66V21h3.18z"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Horário</h4>
      <p>Segunda a sexta: 8h às 17h30<br>Sábados: 8h às 13h</p>
    </div>
    <div class="footer-map">
      <iframe title="Localização Itamaraty Estética Automotiva" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Av.+Itamarati,+807+-+Vila+Aeroporto,+Campinas+-+SP,+13054-150&output=embed"></iframe>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-bottom-text">
      <span>© 2026 Itamaraty Estética Automotiva. Todos os direitos reservados.</span>
      <span class="footer-credit">Feito por
        <a href="https://github.com/ViniDevBR" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          Vinicius
        </a>
      </span>
    </div>
    <seo-tags-modal>
      <div class="seo-tag-group">
        <h4>Serviços</h4>
        <ul class="seo-tags">
          <li>Lavagem técnica automotiva</li>
          <li>Lavagem de motor e chassi</li>
          <li>Higienização interna automotiva</li>
          <li>Descontaminação de pintura</li>
          <li>Polimento técnico automotivo</li>
          <li>Cristalização de pintura</li>
          <li>Vitrificação cerâmica automotiva</li>
          <li>Enceramento automotivo</li>
          <li>Restauração de faróis</li>
          <li>Restauração de couro automotivo</li>
          <li>Revitalização de plásticos automotivos</li>
          <li>Customização de bancos automotivos</li>
          <li>Estética automotiva para motos</li>
        </ul>
      </div>
      <div class="seo-tag-group">
        <h4>Localização</h4>
        <ul class="seo-tags">
          <li>Estética automotiva Campinas</li>
          <li>Detalhamento automotivo Campinas SP</li>
          <li>Estética automotiva Vila Aeroporto</li>
          <li>Lavagem detalhada Campinas</li>
          <li>Vitrificação de pintura Campinas</li>
          <li>Polimento automotivo Campinas</li>
          <li>Estúdio de estética automotiva Campinas</li>
          <li>Estética automotiva região de Campinas</li>
        </ul>
      </div>
      <div class="seo-tag-group">
        <h4>Diferenciais técnicos</h4>
        <ul class="seo-tags">
          <li>Medição de espessura de verniz</li>
          <li>Certificação Colortek Leather</li>
          <li>Certificação IDC</li>
          <li>Membro IDA — International Detailing Association</li>
          <li>Linha GZOX / Prospec</li>
          <li>Profissional do Ano — Detailerfest 2025</li>
          <li>Avaliação técnica antes do serviço</li>
        </ul>
      </div>
    </seo-tags-modal>
  </div>
</footer>

<a href="${waCta}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Falar com um especialista pelo WhatsApp">
  <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4 8.36 4 14.98c0 2.2.58 4.28 1.68 6.13L4 29l8.1-1.63a12.9 12.9 0 0 0 3.92.6h.01c6.62 0 12.02-5.36 12.02-11.98C28.05 8.36 22.64 3 16.02 3zm0 21.9h-.01a10 10 0 0 1-5.08-1.39l-.36-.21-3.8.76.8-3.7-.24-.38a9.9 9.9 0 0 1-1.53-5.3c0-5.47 4.46-9.92 9.94-9.92 2.65 0 5.14 1.04 7.02 2.92a9.86 9.86 0 0 1 2.91 7.02c0 5.47-4.46 9.92-9.65 9.92zm5.44-7.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
</a>

<image-modal></image-modal>

<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script type="module" src="../components/before-after-slider.js"></script>
<script type="module" src="../components/image-modal.js"></script>
<script type="module" src="../components/seo-tags-modal.js"></script>
<script src="../js/service.js"></script>
</body>
</html>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const svc of SERVICES) {
  const html = renderPage(svc);
  writeFileSync(join(OUT_DIR, `${svc.slug}.html`), html, 'utf8');
  console.log(`generated servicos/${svc.slug}.html`);
}
console.log(`\n${SERVICES.length} páginas geradas em ${OUT_DIR}`);
