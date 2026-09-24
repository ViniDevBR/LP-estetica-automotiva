(() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const scrollContainer = document.getElementById('scroll-container');
  const heroSection = document.getElementById('hero');
  const header = document.querySelector('.site-header');

  function initAll() {
    initLenis();
    initHeaderScroll();
    initHeroLoadIn();
    initHeroTransition();
    initSectionAnimations();
    initMarquee();
    initFaqAccordion();
    ScrollTrigger.refresh();

    // As fontes carregam de forma assíncrona e podem mudar a altura de
    // seções (quebra de linha diferente), o que deixa os cálculos de
    // início/fim do ScrollTrigger desatualizados se não recalcularmos
    // depois que elas (e o resto dos assets) realmente terminarem.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
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
      }
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
    document.querySelectorAll('.scroll-section').forEach((section) => {
      const type = section.dataset.animation;
      const tl = buildTimeline(section, type);

      ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          section.style.opacity = 1;
          tl.play();
          if (section.id === 'stats') animateStatCounters();
        }
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
