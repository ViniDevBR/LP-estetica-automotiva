/**
 * <review-slider> — carrossel cujo conteúdo vem do DOM claro (light DOM),
 * não de atributos/JSON. Isso mantém os comentários no HTML renderizado
 * no servidor, visíveis para qualquer crawler (SEO/GEO) mesmo sem JS.
 * O Shadow DOM cuida só do "trilho" e dos controles (setas/contador).
 *
 * Uso:
 *   <review-slider>
 *     <blockquote class="testimonial-card">...</blockquote>
 *     <blockquote class="testimonial-card">...</blockquote>
 *     ...
 *   </review-slider>
 */
class ReviewSlider extends HTMLElement {
  constructor() {
    super();
    this._index = 0;
    this._currentX = 0;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .viewport { overflow: hidden; touch-action: pan-y; }
        .track {
          display: flex;
          align-items: stretch;
          gap: 1.2rem;
          transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
          will-change: transform;
        }
        ::slotted(*) {
          flex: 0 0 100%;
          box-sizing: border-box;
        }
        @media (min-width: 720px) {
          ::slotted(*) { flex: 0 0 calc(50% - 0.6rem); }
        }
        @media (min-width: 1080px) {
          ::slotted(*) { flex: 0 0 calc(33.333% - 0.8rem); }
        }
        .controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.2rem;
          margin-top: 1.8rem;
        }
        button.nav {
          width: 38px;
          height: 38px;
          border: 1px solid var(--hairline-strong, rgba(255, 255, 255, 0.16));
          background: transparent;
          color: var(--text, #eef1f4);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        button.nav:hover { border-color: var(--blue-bright, #7db2ff); color: var(--blue-bright, #7db2ff); }
        button.nav:focus-visible { outline: 2px solid var(--blue-bright, #7db2ff); outline-offset: 2px; }
        .counter {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          color: var(--text-faint, #5b626c);
          min-width: 5.5em;
          text-align: center;
        }
        .counter strong { color: var(--blue-bright, #7db2ff); font-weight: 600; }
        @media (prefers-reduced-motion: reduce) {
          .track { transition: none; }
        }
      </style>
      <div class="viewport" part="viewport">
        <div class="track" part="track"><slot></slot></div>
      </div>
      <div class="controls" part="controls">
        <button type="button" class="nav prev" part="prev" aria-label="Avaliação anterior">&larr;</button>
        <span class="counter" part="counter"><strong class="cur">1</strong>&nbsp;/&nbsp;<span class="total">1</span></span>
        <button type="button" class="nav next" part="next" aria-label="Próxima avaliação">&rarr;</button>
      </div>
    `;
    this._track = this.shadowRoot.querySelector('.track');
    this._prevBtn = this.shadowRoot.querySelector('.prev');
    this._nextBtn = this.shadowRoot.querySelector('.next');
    this._curEl = this.shadowRoot.querySelector('.cur');
    this._totalEl = this.shadowRoot.querySelector('.total');
    this._viewport = this.shadowRoot.querySelector('.viewport');

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onResize = () => this._update(false);
  }

  connectedCallback() {
    this.setAttribute('role', 'region');
    this.setAttribute('aria-roledescription', 'carrossel');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Avaliações de clientes');
    this.setAttribute('tabindex', '0');

    this._slides = Array.from(this.children);
    this._slides.forEach((el, i) => {
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'slide');
      el.setAttribute('aria-label', `Avaliação ${i + 1} de ${this._slides.length}`);
    });
    this._totalEl.textContent = String(this._slides.length);

    this._prevBtn.addEventListener('click', () => this.go(this._index - 1));
    this._nextBtn.addEventListener('click', () => this.go(this._index + 1));
    this._viewport.addEventListener('pointerdown', this._onPointerDown);
    this.addEventListener('keydown', this._onKeyDown);

    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(this);

    requestAnimationFrame(() => this._update(false));
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  go(index) {
    const n = this._slides.length;
    this._index = ((index % n) + n) % n;
    this._curEl.textContent = String(this._index + 1);
    this._update(true);
  }

  _update(animate) {
    const target = this._slides[this._index];
    if (!target) return;
    // getBoundingClientRect() on both already reflects any transform
    // currently applied to .track, and that shift cancels out in the
    // subtraction below — so `delta` is always the slide's natural
    // (untransformed) offset from the track's own left edge. The new
    // transform must therefore be set to -delta directly, not
    // accumulated on top of the previous value.
    const trackRect = this._track.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const delta = targetRect.left - trackRect.left;
    this._currentX = -delta;
    if (!animate) this._track.style.transitionDuration = '0ms';
    this._track.style.transform = `translateX(${this._currentX}px)`;
    if (!animate) {
      requestAnimationFrame(() => { this._track.style.transitionDuration = ''; });
    }
  }

  _onPointerDown(e) {
    this._dragStartX = e.clientX;
    this._dragBaseX = this._currentX;
    this._dragging = true;
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    const delta = e.clientX - this._dragStartX;
    this._track.style.transitionDuration = '0ms';
    this._track.style.transform = `translateX(${this._dragBaseX + delta}px)`;
  }

  _onPointerUp(e) {
    if (!this._dragging) return;
    this._dragging = false;
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    this._track.style.transitionDuration = '';
    const delta = e.clientX - this._dragStartX;
    if (delta < -40) this.go(this._index + 1);
    else if (delta > 40) this.go(this._index - 1);
    else this._update(true);
  }

  _onKeyDown(e) {
    if (e.key === 'ArrowLeft') { this.go(this._index - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { this.go(this._index + 1); e.preventDefault(); }
  }
}

customElements.define('review-slider', ReviewSlider);
