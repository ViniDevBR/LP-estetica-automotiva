// Gera as páginas estáticas em /servicos/*.html a partir de SERVICES.
// Rodar novamente sempre que o conteúdo dos serviços mudar (ex: quando
// fotos reais de antes/depois substituírem os placeholders).
//
//   node scripts/generate-services.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'servicos');

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
    eyebrow: 'LAVAGEM TÉCNICA',
    heroWords: [['LAVAGEM'], ['TÉCNICA.']],
    tagline: 'Descontaminação completa da carroceria com pH neutro e técnica de dois baldes — a base de qualquer detalhamento, sem risco à pintura.',
    metaDescription: 'Lavagem técnica automotiva em Campinas/SP: descontaminação com pH neutro e técnica de dois baldes, sem risco à pintura. Itamaraty Estética Automotiva.',
    steps: [
      { title: 'Pré-lavagem (snow foam)', desc: 'Remove sujeira solta sem contato direto, reduzindo o risco de marcas de água (marring) na pintura.' },
      { title: 'Lavagem dois baldes', desc: 'Balde de lavagem e balde de enxágue separados, evitando reintroduzir partículas abrasivas na luva.' },
      { title: 'Descontaminação química e física', desc: 'Remove piche, ferrugem industrial e resíduos que o xampu sozinho não retira.' },
      { title: 'Secagem controlada', desc: 'Toalhas de microfibra e soprador, sem arrastar sujeira residual sobre a pintura.' }
    ]
  },
  {
    slug: 'motor-chassi',
    code: '02',
    name: 'Motor e Chassi',
    eyebrow: 'MOTOR E CHASSI',
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
    eyebrow: 'HIGIENIZAÇÃO INTERNA',
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
    eyebrow: 'PROTEÇÃO DE PINTURA',
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
    eyebrow: 'RESTAURAÇÃO DE FARÓIS',
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
    eyebrow: 'RESTAURAÇÃO DE COURO',
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
    eyebrow: 'SERVIÇOS PARA MOTOS',
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
    eyebrow: 'CUSTOMIZAÇÃO DE BANCOS',
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

function galleryHtml(svc) {
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

function gridHtml(svc) {
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
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">

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
    <span class="section-label">ITAMARATY — ${svc.eyebrow}</span>
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
    <span class="section-label">COMO FUNCIONA</span>
    <h2 class="svc-section-heading">Etapas do serviço</h2>
  </div>
  <ol class="process-list">${stepsHtml(svc.steps)}
  </ol>
</section>

<section class="svc-section svc-gallery" id="resultados">
  <div class="svc-section-head">
    <span class="section-label">RESULTADOS</span>
    <h2 class="svc-section-heading">Arraste para comparar</h2>
    <p class="svc-section-body">Exemplos ilustrativos do padrão de acabamento buscado neste serviço — arraste a linha para revelar o antes e o depois. <em>(Fotos reais deste serviço em breve.)</em></p>
  </div>
  <div class="svc-gallery-grid">${galleryHtml(svc)}
  </div>
</section>

<section class="svc-section svc-showcase" id="galeria">
  <div class="svc-section-head">
    <span class="section-label">GALERIA</span>
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
    <span class="section-label">PRÓXIMO PASSO</span>
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
      <p>Av. Itamarati, 807 — Vila Aeroporto<br>Campinas/SP, 13054-150</p>
      <p><a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">(19) 99309-7721</a></p>
      <p><a href="https://www.instagram.com/itamaraty_autoestetica" target="_blank" rel="noopener">@itamaraty_autoestetica</a></p>
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
    <span>© 2026 Itamaraty Estética Automotiva. Todos os direitos reservados.</span>
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
