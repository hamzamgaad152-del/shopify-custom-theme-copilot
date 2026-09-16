/**
 * Shopify Starter Theme JavaScript
 * Lightweight, vanilla JavaScript for responsive navigation, product forms, and interactions.
 */

window.EcrinluxTheme = window.EcrinluxTheme || {};

function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    drawer.classList.toggle('is-active');
  });

  document.addEventListener('click', (event) => {
    if (drawer.classList.contains('is-active') && !drawer.contains(event.target) && !toggleBtn.contains(event.target)) {
      drawer.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initVariantSelectors() {
  const variantSelect = document.querySelector('[data-variant-select]');
  if (!variantSelect) return;

  variantSelect.addEventListener('change', (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const available = selectedOption.getAttribute('data-available') === 'true';

    const priceContainer = document.querySelector('.product-info__price .price-item--regular');
    if (priceContainer && price) {
      priceContainer.textContent = price;
    }

    const submitButton = document.querySelector('[data-add-to-cart]');
    if (submitButton) {
      if (available) {
        submitButton.removeAttribute('disabled');
        submitButton.textContent = submitButton.getAttribute('data-text-add') || 'Ajouter au panier';
      } else {
        submitButton.setAttribute('disabled', 'disabled');
        submitButton.textContent = submitButton.getAttribute('data-text-sold-out') || 'Rupture de stock';
      }
    }
  });
}

function initRevealAnimations() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => observer.observe(el));
}

function initScrollCue() {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;

  const hideCue = () => cue.classList.add('is-hidden');
  window.addEventListener('scroll', hideCue, { once: true });
}

function initCatalogTabs() {
  const tabSection = document.querySelector('[data-catalogue-tabs]');
  if (!tabSection) return;

  const buttons = Array.from(tabSection.querySelectorAll('[data-tab-button]'));
  const panels = Array.from(tabSection.querySelectorAll('[data-tab-panel]'));

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tabButton;

      buttons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        const active = panel.dataset.tabPanel === target;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    });
  });
}

function initBespokeBuilder() {
  const builderSection = document.querySelector('[data-bespoke-builder]');
  if (!builderSection) return;

  const form = builderSection.querySelector('#bespokeForm');
  const steps = Array.from(builderSection.querySelectorAll('.builder-step'));
  const progressBar = builderSection.querySelector('#builderProgressBar');
  const caseElement = builderSection.querySelector('#builderCase');
  const notice = builderSection.querySelector('#builderNotice');
  const copyLinkButton = builderSection.querySelector('#copyLinkButton');
  const addToCartButton = builderSection.querySelector('#addToCartButton');

  const defaultState = {
    step: 0,
    object: '',
    width: 28,
    depth: 18,
    height: 22,
    panels: { base: 'clear', back: 'clear', top: 'clear', left: 'clear', right: 'clear', front: 'clear' },
    engraving: false,
    led: false,
    raised: false,
    rotating: false,
    engravingText: ''
  };

  function readState() {
    const saved = JSON.parse(localStorage.getItem('ecrinlux-bespoke') || 'null') || defaultState;
    const params = new URLSearchParams(window.location.search);
    return {
      ...defaultState,
      ...saved,
      object: params.get('object') || saved.object || defaultState.object,
      width: Number(params.get('width')) || Number(saved.width) || defaultState.width,
      depth: Number(params.get('depth')) || Number(saved.depth) || defaultState.depth,
      height: Number(params.get('height')) || Number(saved.height) || defaultState.height,
      engravingText: params.get('engraving') || saved.engravingText || defaultState.engravingText
    };
  }

  function writeState(state) {
    localStorage.setItem('ecrinlux-bespoke', JSON.stringify(state));
    const params = new URLSearchParams();
    if (state.object) params.set('object', state.object);
    if (state.width) params.set('width', String(state.width));
    if (state.depth) params.set('depth', String(state.depth));
    if (state.height) params.set('height', String(state.height));
    if (state.engravingText) params.set('engraving', state.engravingText);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }

  function updatePreview(state) {
    const palette = {
      clear: 'rgba(186, 214, 255, 0.32)',
      'noir-profond': '#171a1d',
      'fume': 'rgba(142, 152, 168, 0.72)',
      'blanc-opale': '#f2f3f4',
      'bleu-nuit': '#2c4d82',
      'rouge-carmin': '#6f1d1b',
      'vert-racing': '#295840',
      'or-miroir': '#b99334',
      'argent-miroir': '#a8b1bb'
    };

    Object.entries(state.panels).forEach(([key, value]) => {
      const face = caseElement.querySelector(`[data-panel-face="${key}"]`);
      if (face) face.style.background = palette[value] || palette.clear;
    });

    const widthPx = Math.max(120, Math.min(240, state.width * 6));
    const depthPx = Math.max(80, Math.min(170, state.depth * 5));
    const heightPx = Math.max(120, Math.min(240, state.height * 6));

    caseElement.style.setProperty('--case-width', `${widthPx}px`);
    caseElement.style.setProperty('--case-depth', `${depthPx}px`);
    caseElement.style.setProperty('--case-height', `${heightPx}px`);
  }

  function syncInputs(state) {
    const objectInput = builderSection.querySelector('#objectName');
    const widthInput = builderSection.querySelector('#widthInput');
    const depthInput = builderSection.querySelector('#depthInput');
    const heightInput = builderSection.querySelector('#heightInput');
    const engravingInput = builderSection.querySelector('#engravingText');

    if (objectInput) objectInput.value = state.object;
    if (widthInput) widthInput.value = state.width;
    if (depthInput) depthInput.value = state.depth;
    if (heightInput) heightInput.value = state.height;
    if (engravingInput) engravingInput.value = state.engravingText;

    builderSection.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = !!state[input.name];
    });

    builderSection.querySelectorAll('input[type="radio"]').forEach((input) => {
      const panelKey = input.name.replace('panel_', '');
      if (panelKey && state.panels && state.panels[panelKey]) {
        input.checked = input.value === state.panels[panelKey];
      }
    });
  }

  function renderSummary(state) {
    builderSection.querySelector('#summaryObject').textContent = state.object || 'Objet non nommé';
    builderSection.querySelector('#summaryDimensions').textContent = `${state.width} × ${state.depth} × ${state.height} cm`;
    const panelSummary = Object.entries(state.panels)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    builderSection.querySelector('#summaryPanels').textContent = panelSummary;

    const options = [];
    if (state.engraving) options.push('gravure');
    if (state.led) options.push('LED');
    if (state.raised) options.push('socle');
    if (state.rotating) options.push('rotatif');
    builderSection.querySelector('#summaryOptions').textContent = options.length ? options.join(', ') : 'Aucune option';
  }

  function goToStep(stepIndex) {
    const safeStep = Math.min(Math.max(stepIndex, 0), steps.length - 1);
    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === safeStep);
    });
    const progress = ((safeStep + 1) / steps.length) * 100;
    progressBar.style.width = `${progress}%`;
    const currentState = readState();
    writeState(currentState);
  }

  function gatherCurrentInputState() {
    const state = readState();
    const objectValue = builderSection.querySelector('#objectName');
    const widthValue = Number(builderSection.querySelector('#widthInput').value || state.width);
    const depthValue = Number(builderSection.querySelector('#depthInput').value || state.depth);
    const heightValue = Number(builderSection.querySelector('#heightInput').value || state.height);
    const engravingTextValue = builderSection.querySelector('#engravingText').value || '';
    const panels = {
      base: builderSection.querySelector('input[name="panel_base"]:checked')?.value || state.panels.base,
      back: builderSection.querySelector('input[name="panel_back"]:checked')?.value || state.panels.back,
      top: builderSection.querySelector('input[name="panel_top"]:checked')?.value || state.panels.top,
      left: builderSection.querySelector('input[name="panel_left"]:checked')?.value || state.panels.left,
      right: builderSection.querySelector('input[name="panel_right"]:checked')?.value || state.panels.right,
      front: builderSection.querySelector('input[name="panel_front"]:checked')?.value || state.panels.front
    };

    return {
      ...state,
      object: objectValue ? objectValue.value : state.object,
      width: widthValue,
      depth: depthValue,
      height: heightValue,
      engravingText: engravingTextValue,
      engraving: builderSection.querySelector('input[name="engraving"]')?.checked || false,
      led: builderSection.querySelector('input[name="led"]')?.checked || false,
      raised: builderSection.querySelector('input[name="raised"]')?.checked || false,
      rotating: builderSection.querySelector('input[name="rotating"]')?.checked || false,
      panels
    };
  }

  function applyState() {
    const state = readState();
    syncInputs(state);
    updatePreview(state);
    renderSummary(state);
    const currentStep = state.step || 0;
    goToStep(currentStep);
  }

  builderSection.querySelectorAll('.next-step').forEach((button) => {
    button.addEventListener('click', () => {
      const state = gatherCurrentInputState();
      state.step = Math.min(state.step + 1, steps.length - 1);
      localStorage.setItem('ecrinlux-bespoke', JSON.stringify(state));
      syncInputs(state);
      updatePreview(state);
      renderSummary(state);
      goToStep(state.step);
    });
  });

  builderSection.querySelectorAll('.prev-step').forEach((button) => {
    button.addEventListener('click', () => {
      const state = gatherCurrentInputState();
      state.step = Math.max(state.step - 1, 0);
      localStorage.setItem('ecrinlux-bespoke', JSON.stringify(state));
      syncInputs(state);
      renderSummary(state);
      goToStep(state.step);
    });
  });

  builderSection.querySelectorAll('.stepper-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.target;
      const input = builderSection.querySelector(`#${key}Input`);
      const currentValue = Number(input.value || 0);
      const delta = button.dataset.action === 'increase' ? 1 : -1;
      input.value = Math.min(Math.max(currentValue + delta, 5), 120);
      input.dispatchEvent(new Event('input'));
    });
  });

  builderSection.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      const state = gatherCurrentInputState();
      localStorage.setItem('ecrinlux-bespoke', JSON.stringify(state));
      updatePreview(state);
      renderSummary(state);
      writeState(state);
    });

    input.addEventListener('change', () => {
      const state = gatherCurrentInputState();
      localStorage.setItem('ecrinlux-bespoke', JSON.stringify(state));
      updatePreview(state);
      renderSummary(state);
      writeState(state);
    });
  });

  copyLinkButton.addEventListener('click', async () => {
    const state = gatherCurrentInputState();
    const url = `${window.location.origin}${window.location.pathname}?object=${encodeURIComponent(state.object || '')}&width=${state.width}&depth=${state.depth}&height=${state.height}`;
    try {
      await navigator.clipboard.writeText(url);
      notice.textContent = 'Lien de configuration copié.';
    } catch (error) {
      notice.textContent = 'Copie impossible dans ce navigateur, mais votre configuration est sauvegardée localement.';
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = gatherCurrentInputState();
    notice.textContent = `Votre écrin entre en atelier. ${state.object || 'Pièce'} est prêt à être préparé.`;
    localStorage.setItem('ecrinlux-bespoke', JSON.stringify({ ...state, step: 4 }));
  });

  applyState();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initVariantSelectors();
  initRevealAnimations();
  initScrollCue();
  initCatalogTabs();
  initBespokeBuilder();
});

window.EcrinluxTheme = {
  initMobileNav,
  initVariantSelectors,
  initRevealAnimations,
  initScrollCue,
  initCatalogTabs,
  initBespokeBuilder
};
