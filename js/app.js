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

    if (RELEASE_COUNT < FRAME_COUNT) {
      const background = [];
      for (let i = RELEASE_COUNT + 1; i <= FRAME_COUNT; i++) background.push(loadFrame(i));
      Promise.all(background); // não bloqueia — carrega enquanto o usuário navega
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
    initHeaderScroll();
    initHeroLoadIn();
    initHeroTransition();
    initFrameScrollBinding();
    initSectionAnimations();
    initCounters();
    initMarquee();
    initDarkOverlay();
    ScrollTrigger.refresh();
  }

  function initLenis() {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
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

    switch (type) {
      case 'fade-up':
        tl.from(children, { y: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
        break;
      case 'slide-left':
        tl.from(children, { x: -80, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
        break;
      case 'slide-right':
        tl.from(children, { x: 80, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out' });
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

  function initCounters() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      ScrollTrigger.create({
        trigger: '#stats',
        start: 'top 85%',
        onEnter: () => {
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
        },
        once: true
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

  function initDarkOverlay() {
    const overlay = document.getElementById('dark-overlay');
    const stats = document.getElementById('stats');
    if (!stats) return;
    const setOverlay = (value) => gsap.to(overlay, { opacity: value, duration: 0.5, ease: 'power2.out' });
    ScrollTrigger.create({
      trigger: stats,
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => setOverlay(0.9),
      onEnterBack: () => setOverlay(0.9),
      onLeave: () => setOverlay(0),
      onLeaveBack: () => setOverlay(0)
    });
  }

  function initParticles() {
    if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;
    particlesJS.load('particles-js', 'assets/particles.json');
  }

  initParticles();
  preloadFrames();
})();
