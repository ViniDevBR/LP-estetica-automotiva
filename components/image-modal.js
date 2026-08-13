/**
 * <image-modal></image-modal> — place once per page.
 * Fullscreen lightbox. API:
 *   const modal = document.querySelector('image-modal');
 *   modal.open({ src, alt, caption });
 *   modal.close();
 */
class ImageModal extends HTMLElement {
  constructor() {
    super();
    this._lastFocused = null;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 500;
          align-items: center;
          justify-content: center;
          padding: 4vh 4vw;
        }
        :host([open]) { display: flex; }
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(8, 9, 11, 0.92);
        }
        figure {
          position: relative;
          margin: 0;
          max-width: 92vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        img {
          max-width: 92vw;
          max-height: 82vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border: 1px solid var(--hairline-strong, rgba(255,255,255,0.16));
          background: var(--graphite, #131519);
        }
        figcaption {
          margin-top: 0.8rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          color: var(--text-dim, #9aa1ab);
          text-align: center;
        }
        figcaption:empty { display: none; }
        .close {
          position: absolute;
          top: -2.6rem;
          right: 0;
          width: 40px;
          height: 40px;
          border: 1px solid var(--hairline-strong, rgba(255,255,255,0.16));
          background: var(--void, #08090b);
          color: var(--text, #eef1f4);
          font-size: 1.3rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close:hover { border-color: var(--blue-bright, #7db2ff); color: var(--blue-bright, #7db2ff); }
        .close:focus-visible { outline: 2px solid var(--blue-bright, #7db2ff); outline-offset: 3px; }
      </style>
      <div class="backdrop" part="backdrop"></div>
      <figure>
        <button class="close" part="close" aria-label="Fechar">&times;</button>
        <img part="image" alt="">
        <figcaption part="caption"></figcaption>
      </figure>
    `;
    this._imgEl = this.shadowRoot.querySelector('img');
    this._captionEl = this.shadowRoot.querySelector('figcaption');
    this._closeBtn = this.shadowRoot.querySelector('.close');
    this._backdrop = this.shadowRoot.querySelector('.backdrop');
    this._onKeyDown = this._onKeyDown.bind(this);
    this.close = this.close.bind(this);
    this._closeBtn.addEventListener('click', this.close);
    this._backdrop.addEventListener('click', this.close);
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');
  }

  open({ src, alt = '', caption = '' } = {}) {
    this._lastFocused = document.activeElement;
    this._imgEl.src = src;
    this._imgEl.alt = alt;
    this._captionEl.textContent = caption;
    this.setAttribute('open', '');
    document.addEventListener('keydown', this._onKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => this._closeBtn.focus());
  }

  close() {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    document.removeEventListener('keydown', this._onKeyDown);
    document.body.style.overflow = '';
    this._imgEl.src = '';
    if (this._lastFocused && typeof this._lastFocused.focus === 'function') {
      this._lastFocused.focus();
    }
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') { this.close(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      this._closeBtn.focus();
    }
  }
}

customElements.define('image-modal', ImageModal);
