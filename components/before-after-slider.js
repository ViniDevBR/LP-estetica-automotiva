/**
 * <before-after-slider before="..." after="..." before-label="Antes" after-label="Depois" alt="...">
 * Reusable swipe-reveal / before-and-after comparison. Shadow DOM; reads the
 * host page's design tokens (--primary-bright, --font-accent, --void) via CSS
 * custom properties, which pierce the shadow boundary.
 */
class BeforeAfterSlider extends HTMLElement {
  static get observedAttributes() {
    return ['before', 'after', 'before-label', 'after-label', 'alt', 'start'];
  }

  constructor() {
    super();
    this._pos = 50;
    this._dragging = false;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          border: 1px solid var(--hairline-strong, rgba(255,255,255,0.16));
          background: var(--graphite, #131519);
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .wrap { position: absolute; inset: 0; cursor: ew-resize; }
        img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .img-before {
          clip-path: inset(0 calc(100% - var(--pos, 50%)) 0 0);
        }
        .tag {
          position: absolute;
          top: 0.8rem;
          font-family: var(--font-accent, sans-serif);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text, #eef1f4);
          background: var(--void-a55, rgba(8, 9, 11, 0.55));
          padding: 0.3rem 0.6rem;
          pointer-events: none;
        }
        .tag-before { left: 0.8rem; }
        .tag-after { right: 0.8rem; color: var(--primary-bright, #f5cc1f); }
        .divider {
          position: absolute;
          top: 0; bottom: 0;
          left: var(--pos, 50%);
          width: 2px;
          background: var(--primary-bright, #f5cc1f);
          transform: translateX(-50%);
          box-shadow: 0 0 8px 1px var(--primary-glow, rgba(245,204,31,0.35));
        }
        .handle {
          position: absolute;
          top: 50%; left: 50%;
          width: 34px; height: 34px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: var(--primary-bright, #f5cc1f);
          color: var(--void, #08090b);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          box-shadow: 0 4px 14px var(--shadow-50, rgba(0,0,0,0.5));
        }
        .handle:focus-visible {
          outline: 2px solid var(--text, #eef1f4);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      </style>
      <div class="wrap" part="wrap">
        <img class="img-after" part="after" draggable="false">
        <img class="img-before" part="before" draggable="false">
        <span class="tag tag-before" part="tag-before"></span>
        <span class="tag tag-after" part="tag-after"></span>
        <div class="divider" part="divider">
          <div class="handle" part="handle" role="slider" tabindex="0"
               aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100">⇔</div>
        </div>
      </div>
    `;
    this._wrapEl = this.shadowRoot.querySelector('.wrap');
    this._handleEl = this.shadowRoot.querySelector('.handle');
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    this._syncImages();
    this._syncLabels();
    const start = parseFloat(this.getAttribute('start'));
    this._setPos(Number.isFinite(start) ? start : 50);
    this._wrapEl.addEventListener('pointerdown', this._onPointerDown);
    this._handleEl.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this._wrapEl.removeEventListener('pointerdown', this._onPointerDown);
    this._handleEl.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) return;
    this._syncImages();
    this._syncLabels();
  }

  _syncImages() {
    const before = this.getAttribute('before') || '';
    const after = this.getAttribute('after') || '';
    const alt = this.getAttribute('alt') || '';
    const imgAfter = this.shadowRoot.querySelector('.img-after');
    const imgBefore = this.shadowRoot.querySelector('.img-before');
    if (imgAfter.getAttribute('src') !== after) imgAfter.setAttribute('src', after);
    if (imgBefore.getAttribute('src') !== before) imgBefore.setAttribute('src', before);
    imgAfter.alt = alt ? `${alt} — depois` : 'Depois';
    imgBefore.alt = alt ? `${alt} — antes` : 'Antes';
  }

  _syncLabels() {
    this.shadowRoot.querySelector('.tag-before').textContent = this.getAttribute('before-label') || 'Antes';
    this.shadowRoot.querySelector('.tag-after').textContent = this.getAttribute('after-label') || 'Depois';
  }

  _setPos(pct) {
    this._pos = Math.min(100, Math.max(0, pct));
    this.style.setProperty('--pos', this._pos + '%');
    this._handleEl.setAttribute('aria-valuenow', Math.round(this._pos));
  }

  _updateFromClientX(clientX) {
    const rect = this._wrapEl.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    this._setPos(pct);
  }

  _onPointerDown(e) {
    this._dragging = true;
    this._updateFromClientX(e.clientX);
    this._handleEl.focus();
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    e.preventDefault();
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    this._updateFromClientX(e.clientX);
  }

  _onPointerUp() {
    this._dragging = false;
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  _onKeyDown(e) {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === 'ArrowLeft') { this._setPos(this._pos - step); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { this._setPos(this._pos + step); e.preventDefault(); }
    else if (e.key === 'Home') { this._setPos(0); e.preventDefault(); }
    else if (e.key === 'End') { this._setPos(100); e.preventDefault(); }
  }
}

customElements.define('before-after-slider', BeforeAfterSlider);
