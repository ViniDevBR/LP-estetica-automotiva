/**
 * <seo-tags-modal> — ícone no rodapé que abre um painel com os
 * termos/serviços cobertos pelo site. O conteúdo (light DOM, via
 * <slot>) fica sempre presente no HTML — visível a qualquer crawler,
 * independente do painel estar aberto ou fechado. O Shadow DOM cuida
 * só do botão-gatilho e do chrome do modal (fundo, fechar).
 *
 * Uso:
 *   <seo-tags-modal>
 *     <div class="seo-tag-group">
 *       <h4>Serviços</h4>
 *       <ul class="seo-tags"><li>Lavagem técnica automotiva</li>...</ul>
 *     </div>
 *   </seo-tags-modal>
 */
class SeoTagsModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .trigger {
          width: 30px;
          height: 30px;
          border: 1px solid var(--hairline-strong, rgba(255,255,255,0.16));
          background: transparent;
          color: var(--text-faint, #5b626c);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: color 0.2s ease, border-color 0.2s ease;
          vertical-align: middle;
        }
        .trigger:hover { color: var(--primary-bright, #f5cc1f); border-color: var(--primary-bright, #f5cc1f); }
        .trigger:focus-visible { outline: 2px solid var(--primary-bright, #f5cc1f); outline-offset: 2px; }
        .trigger svg { width: 15px; height: 15px; }

        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 500;
          align-items: center;
          justify-content: center;
          padding: 5vh 5vw;
        }
        :host([open]) .overlay { display: flex; }
        .backdrop { position: absolute; inset: 0; background: var(--void-a92, rgba(8, 9, 11, 0.92)); }
        .panel {
          position: relative;
          width: min(720px, 100%);
          max-height: 86vh;
          overflow-y: auto;
          background: var(--graphite, #131519);
          border: 1px solid var(--hairline-strong, rgba(255,255,255,0.16));
          padding: 2.2rem;
        }
        .panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.6rem;
        }
        .panel-head h3 {
          font-family: var(--font-display, sans-serif);
          font-weight: 800;
          text-transform: uppercase;
          font-size: 1.3rem;
          color: var(--text, #eef1f4);
          margin: 0;
        }
        .close {
          flex-shrink: 0;
          width: 34px; height: 34px;
          border: 1px solid var(--hairline-strong, rgba(255,255,255,0.16));
          background: transparent;
          color: var(--text, #eef1f4);
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
        }
        .close:hover { border-color: var(--primary-bright, #f5cc1f); color: var(--primary-bright, #f5cc1f); }
        .close:focus-visible { outline: 2px solid var(--primary-bright, #f5cc1f); outline-offset: 2px; }
        ::slotted(.seo-tag-group) { margin-bottom: 1.4rem; }
        ::slotted(.seo-tag-group:last-child) { margin-bottom: 0; }
      </style>
      <button type="button" class="trigger" part="trigger" aria-haspopup="dialog" aria-label="Ver termos e serviços (SEO)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
      <div class="overlay" part="overlay">
        <div class="backdrop" part="backdrop"></div>
        <div class="panel" part="panel" role="dialog" aria-modal="true" aria-labelledby="seo-modal-title">
          <div class="panel-head">
            <h3 id="seo-modal-title">Especialidades e termos cobertos</h3>
            <button type="button" class="close" part="close" aria-label="Fechar">&times;</button>
          </div>
          <slot></slot>
        </div>
      </div>
    `;
    this._trigger = this.shadowRoot.querySelector('.trigger');
    this._closeBtn = this.shadowRoot.querySelector('.close');
    this._backdrop = this.shadowRoot.querySelector('.backdrop');
    this._panel = this.shadowRoot.querySelector('.panel');
    this._onKeyDown = this._onKeyDown.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this._trigger.addEventListener('click', this.open);
    this._closeBtn.addEventListener('click', this.close);
    this._backdrop.addEventListener('click', this.close);
  }

  open() {
    this._lastFocused = document.activeElement;
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
    if (this._lastFocused && typeof this._lastFocused.focus === 'function') this._lastFocused.focus();
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') this.close();
  }
}

customElements.define('seo-tags-modal', SeoTagsModal);
