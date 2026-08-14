(() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const FRAME_COUNT = 300;
  const FRAME_SPEED = 1.0;
  const FRAME_PATH = (i) => `frames/frame_${String(i).padStart(4, '0')}.webp`;

  // Batch loading: só uma fatia inicial dos frames bloqueia o loader.
  // O resto carrega em segundo plano depois que a página já está usável.
  const RELEASE_COUNT = Math.min(FRAME_COUNT, Math.max(20, Math.ceil(FRAME_COUNT * 0.3)));

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const canvasWrap = document.getElementById('canvas-wrap');
  const scrollContainer = document.getElementById('scroll-container');
  const heroSection = document.getElementById('hero');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const header = document.querySelector('.site-header');

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let lastValidFrame = 0;
  let currentFrame = -1;
  let bgColor = '#08090b';

  function updateLoaderUI() {
    const pct = Math.round((Math.min(loadedCount, RELEASE_COUNT) / RELEASE_COUNT) * 100);
    loaderBar.style.width = pct + '%';
    loaderPercent.textContent = pct + '%';
  }

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        frames[i - 1] = img;
        loadedCount++;
        updateLoaderUI();
        // Se o usuário já rolou até aqui e o freeze-frame estava
        // segurando um frame antigo, atualiza assim que este chegar.
        if (i - 1 === currentFrame) requestAnimationFrame(() => drawFrame(currentFrame));
        resolve();
      };
      img.onerror = () => {
        loadedCount++;
        updateLoaderUI();
        resolve();
      };
      img.src = FRAME_PATH(i);
    });
  }

  async function preloadFrames() {
    const firstBatch = Math.min(10, FRAME_COUNT);
    for (let i = 1; i <= firstBatch; i++) {
      await loadFrame(i);
    }
    sampleBgColor(frames[0]);
    resizeCanvas();
    drawFrame(0);

    // Carrega até o limite de liberação (ex: 30% dos frames) e já
    // desbloqueia a página — o resto continua em segundo plano.
    const releaseBatch = [];
    for (let i = firstBatch + 1; i <= RELEASE_COUNT; i++) releaseBatch.push(loadFrame(i));
    await Promise.all(releaseBatch);

    loader.classList.add('is-hidden');
    initAll();

    // As fontes carregam de forma assíncrona e podem mudar a altura de
    // seções (quebra de linha diferente), o que deixa os cálculos de
    // início/fim do ScrollTrigger desatualizados se não recalcularmos
    // depois que elas (e o resto dos assets) realmente terminarem.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());

    if (RELEASE_COUNT < FRAME_COUNT) {
      const background = [];
      for (let i = RELEASE_COUNT + 1; i <= FRAME_COUNT; i++) background.push(loadFrame(i));
      Promise.all(background).then(() => ScrollTrigger.refresh()); // recalcula ao terminar o carregamento em segundo plano
    }
  }

  function sampleBgColor(img) {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = 4; c.height = 4;
    const cctx = c.getContext('2d');
    try {
      cctx.drawImage(img, 0, 0, 4, 4);
      const d = cctx.getImageData(0, 0, 1, 1).data;
      bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
    } catch (e) { /* canvas tainted, keep default */ }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const IMAGE_SCALE = 1;
  function drawFrame(index) {
    let img = frames[index];
    if (img) {
      lastValidFrame = index;
    } else {
      // Frame ainda não chegou (carregamento em segundo plano) — segura
      // no último frame válido em vez de piscar/quebrar a imagem.
      img = frames[lastValidFrame];
      if (!img) return;
    }
    const cw = window.innerWidth, ch = window.innerHeight;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function initAll() {
    initLenis();
    initHeaderHeightVar();
    initHeaderScroll();
    initHeroLoadIn();
    initHeroTransition();
    initFrameScrollBinding();
    initSectionAnimations();
    initMarquee();
    initStickyOutro();
    initFaqAccordion();
    ScrollTrigger.refresh();
  }

  function initLenis() {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Elementos marcados com data-lenis-prevent (ou dentro de um) usam
      // o scroll nativo do navegador em vez do smooth scroll global —
      // necessário pro overflow interno das seções do sticky funcionar.
      prevent: (node) => !!(node.closest && node.closest('[data-lenis-prevent]'))
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function initHeaderHeightVar() {
    if (!header) return;
    const sync = () => {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    };
    sync();
    window.addEventListener('resize', sync);
  }

  function initHeaderScroll() {
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        header.classList.toggle('is-scrolled', self.scroll() > 80 || window.scrollY > 80);
      }
    });
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 80);
    });
  }

  function initHeroLoadIn() {
    const words = heroSection.querySelectorAll('.hero-heading .word');
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from(words, { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out' })
      .from('.hero-tagline', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('.hero-benefits span', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, '-=0.3')
      .from('.hero-ctas .btn', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, '-=0.35')
      .from('.trust-strip', { opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.2');
  }

  function initHeroTransition() {
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        heroSection.style.opacity = Math.max(0, 1 - p * 15);
        heroSection.style.pointerEvents = p > 0.05 ? 'none' : 'auto';
        const wipeProgress = Math.min(1, Math.max(0, (p - 0.01) / 0.06));
        const radius = wipeProgress * 78;
        canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;
      }
    });
  }

  function initFrameScrollBinding() {
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
        const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
        if (index !== currentFrame) {
          currentFrame = index;
          requestAnimationFrame(() => drawFrame(currentFrame));
        }
      }
    });
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawFrame(currentFrame >= 0 ? currentFrame : 0);
    });
  }

  const CHILD_SELECTOR = [
    '.section-label', '.section-heading', '.section-body', '.section-note',
    '.cta-button', '.stat', '.service-card', '.diff-item', '.process-item',
    '.testimonial-card', '.faq-item', '.link-arrow'
  ].join(', ');

  function buildTimeline(section, type) {
    const children = section.querySelectorAll(CHILD_SELECTOR);
    const tl = gsap.timeline({ paused: true });
    if (!children.length) return tl;

    // slide-left/slide-right deslocam os itens horizontalmente antes de
    // entrar; em telas estreitas não há margem lateral pra absorver 80px
    // sem estourar a largura da página, então reduz o deslocamento.
    const slideDistance = window.innerWidth < 768 ? 24 : 80;

    switch (type) {
      case 'fade-up':
        tl.from(children, { y: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
        break;
      case 'slide-left':
        tl.from(children, { x: -slideDistance, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
        break;
      case 'slide-right':
        tl.from(children, { x: slideDistance, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out' });
        break;
      case 'scale-up':
        tl.from(children, { scale: 0.88, opacity: 0, stagger: 0.1, duration: 1.0, ease: 'power2.out' });
        break;
      case 'rotate-in':
        tl.from(children, { y: 40, rotation: 2, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out' });
        break;
      case 'stagger-up':
        tl.from(children, { y: 60, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' });
        break;
      case 'clip-reveal':
        tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.12, duration: 1.2, ease: 'power4.inOut' });
        break;
      default:
        tl.from(children, { opacity: 0, duration: 0.8 });
    }
    return tl;
  }

  function initSectionAnimations() {
    const sections = document.querySelectorAll('.scroll-section');

    sections.forEach((section) => {
      const type = section.dataset.animation;
      const persist = section.dataset.persist === 'true';
      const tl = buildTimeline(section, type);
      let entered = false;

      const show = () => {
        section.style.opacity = 1;
        if (!entered) { entered = true; tl.play(); }
      };
      const hide = () => {
        if (persist) return;
        section.style.opacity = 0;
        if (entered) { entered = false; tl.pause(0); }
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        end: 'bottom 20%',
        onEnter: show,
        onEnterBack: show,
        onLeave: hide,
        onLeaveBack: hide
      });
    });
  }

  function animateStatCounters() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      gsap.fromTo(el, { textContent: 0 }, {
        textContent: target,
        duration: 2,
        ease: 'power1.out',
        snap: { textContent: decimals === 0 ? 1 : 0.1 },
        onUpdate: function () {
          el.textContent = decimals === 0
            ? Math.round(el.textContent)
            : parseFloat(el.textContent).toFixed(decimals);
        }
      });
    });
  }

  function initMarquee() {
    const marker = document.getElementById('marquee-trigger');
    document.querySelectorAll('.marquee-wrap').forEach((el) => {
      const speed = parseFloat(el.dataset.scrollSpeed) || -22;
      gsap.to(el.querySelector('.marquee-text'), {
        xPercent: speed,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
      if (!marker) return;
      ScrollTrigger.create({
        trigger: marker,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const opacity = p < 0.5 ? p / 0.5 : 1 - (p - 0.5) / 0.5;
          el.style.opacity = Math.max(0, Math.min(1, opacity)) * 0.9;
        }
      });
    });
  }

  // Sticky único: Stats > Depoimentos > FAQ > CTA se revezam (crossfade
  // simples de opacidade, sem stagger interno) dentro do mesmo cartão
  // fixo, enquanto a seção Processo (atrás) recolhe e escurece um pouco
  // ENQUANTO o cartão se aproxima — não depois que ele já cobriu a tela.
  function initStickyOutro() {
    const wrapper = document.getElementById('sticky-outro');
    if (!wrapper) return;

    const SEGMENTS = [
      { id: 'stats', start: 0, end: 0.4096 },
      { id: 'depoimentos', start: 0.4096, end: 0.6290 },
      { id: 'faq', start: 0.6290, end: 0.8622 },
      { id: 'contato', start: 0.8622, end: 1.001 }
    ].map((s) => ({ ...s, el: document.getElementById(s.id) })).filter((s) => s.el);
    if (!SEGMENTS.length) return;

    let activeIndex = -1;
    let countersFired = false;

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        let idx = SEGMENTS.findIndex((s) => p >= s.start && p < s.end);
        if (idx === -1) idx = p >= SEGMENTS[SEGMENTS.length - 1].start ? SEGMENTS.length - 1 : 0;

        if (idx !== activeIndex) {
          if (activeIndex !== -1) {
            const prev = SEGMENTS[activeIndex].el;
            prev.classList.remove('is-active');
            gsap.to(prev, { opacity: 0, duration: 0.35, ease: 'power2.out' });
          }
          const cur = SEGMENTS[idx].el;
          cur.classList.add('is-active');
          gsap.to(cur, { opacity: 1, duration: 0.4, ease: 'power2.out' });
          if (cur.id === 'stats' && !countersFired) {
            countersFired = true;
            animateStatCounters();
          }
          activeIndex = idx;
        }
      }
    });
  }

  function initFaqAccordion() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const summary = item.querySelector('summary');
      const content = item.querySelector('p');
      if (!summary || !content) return;

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.classList.contains('is-animating')) return;
        item.classList.add('is-animating');

        if (item.open) {
          gsap.to(content, {
            height: 0,
            marginBottom: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
              item.open = false;
              gsap.set(content, { clearProps: 'height,marginBottom,opacity' });
              item.classList.remove('is-animating');
            }
          });
        } else {
          item.open = true;
          const targetHeight = content.scrollHeight;
          gsap.fromTo(content,
            { height: 0, marginBottom: 0, opacity: 0 },
            {
              height: targetHeight,
              marginBottom: '1.2rem',
              opacity: 1,
              duration: 0.35,
              ease: 'power2.out',
              onComplete: () => {
                gsap.set(content, { clearProps: 'height,marginBottom,opacity' });
                item.classList.remove('is-animating');
              }
            }
          );
        }
      });
    });
  }

  function initParticles() {
    if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;
    particlesJS.load('particles-js', 'assets/particles.json');
  }

  initParticles();
  preloadFrames();
})();
