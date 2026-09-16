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
  const previewFrame = builderSection.querySelector('.builder-preview__frame');
  const notice = builderSection.querySelector('#builderNotice');
  const copyLinkButton = builderSection.querySelector('#copyLinkButton');
  const addToCartButton = builderSection.querySelector('#addToCartButton');
  const pricingUrl = builderSection.dataset.pricingUrl || '';
  const pricingFallback = {
    baseRate: 0.0025,
    metalCorners: 9.99,
    panelCosts: {
      transparent: 0,
      "noir-profond": 5,
      "fume": 5,
      "blanc-opale": 5,
      "bleu-nuit": 5,
      "rouge-carmin": 5,
      "vert-racing": 5,
      "or-miroir": 5,
      "argent-miroir": 5
    }
  };
  let customPricing = pricingFallback;
  let manualRotation = { x: 0, y: 0 };
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  const defaultState = {
    step: 0,
    object: '',
    width: 20,
    depth: 16,
    height: 20,
    panels: { base: 'transparent', back: 'transparent', top: 'transparent', left: 'transparent', right: 'transparent', front: 'transparent' },
    cornerType: 'plastic',
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
      cornerType: params.get('corner') || saved.cornerType || defaultState.cornerType,
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
    if (state.cornerType) params.set('corner', state.cornerType);
    if (state.engravingText) params.set('engraving', state.engravingText);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
  }

  function getPricing(state) {
    const pricing = customPricing || pricingFallback;
    const volumeCm3 = Number(state.width) * Number(state.depth) * Number(state.height);
    const baseCost = volumeCm3 * (pricing.baseRate || pricingFallback.baseRate);
    const panelCost = Object.values(state.panels)
      .reduce((sum, panelColor) => sum + (pricing.panelCosts?.[panelColor] ?? pricingFallback.panelCosts[panelColor] ?? 0), 0);
    const cornerCost = state.cornerType === 'metal' ? (pricing.metalCorners || pricingFallback.metalCorners) : 0;
    return Number((baseCost + panelCost + cornerCost).toFixed(2));
  }

  function updatePreview(state) {
    const palette = {
      transparent: 'rgba(170, 214, 255, 0.22)',
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
      if (face) {
        const isTransparent = value === 'transparent';
        face.style.background = palette[value] || palette.transparent;
        face.style.borderColor = isTransparent ? 'rgba(255, 255, 255, 0.32)' : 'rgba(255,255,255,0.12)';
        face.style.boxShadow = isTransparent
          ? 'inset 0 0 18px rgba(190,215,255,0.18), 0 0 0 1px rgba(255,255,255,0.08)'
          : 'inset 0 0 18px rgba(255,255,255,0.08), 0 18px 28px rgba(0,0,0,0.22)';
      }
    });

    const widthRatio = Math.max(0.9, Math.min(1.6, Number(state.width) / 28));
    const depthRatio = Math.max(0.8, Math.min(1.6, Number(state.depth) / 18));
    const heightRatio = Math.max(0.9, Math.min(1.6, Number(state.height) / 22));

    const widthPx = Math.round(160 * widthRatio);
    const depthPx = Math.round(120 * depthRatio);
    const heightPx = Math.round(160 * heightRatio);

    caseElement.style.setProperty('--case-width', `${widthPx}px`);
    caseElement.style.setProperty('--case-depth', `${depthPx}px`);
    caseElement.style.setProperty('--case-height', `${heightPx}px`);

    const xAngle = (manualRotation.x || 0) % 45;
    const yAngle = (manualRotation.y || 0) % 45;
    const clampedX = Math.min(Math.max(xAngle, -45), 45);
    const clampedY = Math.min(Math.max(yAngle, -45), 45);

    caseElement.style.transform = `rotateX(${clampedX}deg) rotateY(${clampedY}deg) scale(1.08)`;

    const price = getPricing(state);
    const priceEstimate = builderSection.querySelector('#builderPriceEstimate');
    if (priceEstimate) priceEstimate.textContent = `Estimation : ${formatCurrency(price)}`;
    const summaryPrice = builderSection.querySelector('#summaryPrice');
    if (summaryPrice) summaryPrice.textContent = formatCurrency(price);

    builderSection.querySelector('#previewWidth').textContent = Number(state.width).toFixed(0);
    builderSection.querySelector('#previewDepth').textContent = Number(state.depth).toFixed(0);
    builderSection.querySelector('#previewHeight').textContent = Number(state.height).toFixed(0);
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
      if (input.name === 'corner_type') {
        input.checked = input.value === state.cornerType;
        return;
      }
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
    builderSection.querySelector('#summaryOptions').textContent = state.cornerType === 'metal' ? 'Coins métalliques premium' : 'Coins plexiglass standard';
    builderSection.querySelector('#summaryPrice').textContent = formatCurrency(getPricing(state));
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
    const engravingTextValue = builderSection.querySelector('#engravingText')?.value || '';
    const panels = {
      base: builderSection.querySelector('input[name="panel_base"]:checked')?.value || state.panels.base,
      back: builderSection.querySelector('input[name="panel_back"]:checked')?.value || state.panels.back,
      top: builderSection.querySelector('input[name="panel_top"]:checked')?.value || state.panels.top,
      left: builderSection.querySelector('input[name="panel_left"]:checked')?.value || state.panels.left,
      right: builderSection.querySelector('input[name="panel_right"]:checked')?.value || state.panels.right,
      front: builderSection.querySelector('input[name="panel_front"]:checked')?.value || state.panels.front
    };

    const clamped = {
      width: Math.min(Math.max(widthValue, 20), 40),
      depth: Math.min(Math.max(depthValue, 16), 34),
      height: Math.min(Math.max(heightValue, 20), 40)
    };

    return {
      ...state,
      object: objectValue ? objectValue.value : state.object,
      width: clamped.width,
      depth: clamped.depth,
      height: clamped.height,
      engravingText: engravingTextValue,
      cornerType: builderSection.querySelector('input[name="corner_type"]:checked')?.value || state.cornerType || 'plastic',
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

  previewFrame.addEventListener('pointerdown', (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    previewFrame.setPointerCapture(event.pointerId);
  });

  previewFrame.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    manualRotation.y = Math.min(Math.max((manualRotation.y || 0) + deltaX * 0.25, -45), 45);
    manualRotation.x = Math.min(Math.max((manualRotation.x || 0) - deltaY * 0.2, -45), 45);
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    const state = gatherCurrentInputState();
    updatePreview(state);
  });

  previewFrame.addEventListener('pointerup', () => {
    isDragging = false;
  });

  previewFrame.addEventListener('pointerleave', () => {
    isDragging = false;
  });

  builderSection.querySelectorAll('.stepper-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.target;
      const input = builderSection.querySelector(`#${key}Input`);
      const currentValue = Number(input.value || 0);
      const delta = button.dataset.action === 'increase' ? 1 : -1;
      const minValue = key === 'width' ? 20 : key === 'depth' ? 16 : 20;
      const maxValue = key === 'width' ? 40 : key === 'depth' ? 34 : 40;
      input.value = Math.min(Math.max(currentValue + delta, minValue), maxValue);
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
    const url = `${window.location.origin}${window.location.pathname}?object=${encodeURIComponent(state.object || '')}&width=${state.width}&depth=${state.depth}&height=${state.height}&corner=${encodeURIComponent(state.cornerType || 'plastic')}`;
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
    const price = getPricing(state);
    const productId = Number(builderSection.dataset.customProductId || 0);
    const variantId = productId ? Number(productId) : null;

    notice.textContent = `Votre écrin ${state.object || 'sur mesure'} a été estimé à ${formatCurrency(price)}. ${variantId ? 'Le produit est prêt à être ajouté au panier.' : 'Configurez le produit personnalisé dans Shopify pour compléter l’ajout au panier.'}`;
    localStorage.setItem('ecrinlux-bespoke', JSON.stringify({ ...state, step: 4, finalPrice: price }));

    if (variantId && window.Shopify && window.Shopify.storefrontApi) {
      return;
    }

    if (!variantId) {
      return;
    }

    const cartForm = {
      items: [{ id: variantId, quantity: 1, properties: { configuration: JSON.stringify(state) } }]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(cartForm.items[0])
    })
      .then((response) => response.json())
      .then(() => {
        notice.textContent = `Votre écrin ${state.object || 'sur mesure'} a été ajouté au panier pour ${formatCurrency(price)}.`;
        window.location.href = '/cart';
      })
      .catch(() => {
        notice.textContent = `Votre écrin ${state.object || 'sur mesure'} est prêt. Configurez le produit personnalisé Shopify pour l’ajouter au panier.`;
      });
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
