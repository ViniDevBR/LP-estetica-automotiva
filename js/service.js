(() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

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

  function initHeroLoadIn() {
    const hero = document.querySelector('.service-hero');
    if (!hero) return;
    const words = hero.querySelectorAll('.service-hero-heading .word');
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from(words, { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out' })
      .from('.service-hero-tagline', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('.service-hero-ctas .btn', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, '-=0.35')
      .from('.service-back', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5');
  }

  function initSectionHeadReveal() {
    document.querySelectorAll('.svc-section-head').forEach((head) => {
      gsap.set(head.children, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: head,
        start: 'top 85%',
        onEnter: () => gsap.to(head.children, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
      });
    });
  }

  function initStepsReveal() {
    const items = document.querySelectorAll('.svc-steps .process-item');
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 40 });
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' })
    });
  }

  function initGalleryReveal() {
    const items = document.querySelectorAll('.svc-gallery-item');
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 30 });
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
    });
  }

  function initGridReveal() {
    const tiles = document.querySelectorAll('.gallery-tile');
    if (!tiles.length) return;
    gsap.set(tiles, { opacity: 0, scale: 0.94 });
    ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' })
    });
  }

  function initCtaReveal() {
    const cta = document.querySelector('.section-cta-final .section-inner');
    if (!cta) return;
    gsap.set(cta.children, { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: cta,
      start: 'top 88%',
      onEnter: () => gsap.to(cta.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
    });
  }

  function initGridFilter() {
    const grid = document.querySelector('.gallery-grid');
    const buttons = document.querySelectorAll('.svc-filter-btn');
    if (!grid || !buttons.length) return;

    const setCols = (cols) => {
      grid.style.setProperty('--grid-cols', cols);
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cols === String(cols))));
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => setCols(btn.dataset.cols));
    });

    const initialCols = window.innerWidth < 640 ? 2 : 3;
    setCols(initialCols);
  }

  function initLightbox() {
    const modal = document.querySelector('image-modal');
    const tiles = document.querySelectorAll('.gallery-tile');
    if (!modal || !tiles.length) return;
    tiles.forEach((tile) => {
      tile.addEventListener('click', () => {
        modal.open({
          src: tile.dataset.src || tile.querySelector('img').src,
          alt: tile.querySelector('img').alt,
          caption: tile.dataset.caption || ''
        });
      });
    });
  }

  function init() {
    initLenis();
    initHeroLoadIn();
    initSectionHeadReveal();
    initStepsReveal();
    initGalleryReveal();
    initGridReveal();
    initCtaReveal();
    initGridFilter();
    initLightbox();
    ScrollTrigger.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
