/**
 * Shopify Starter Theme JavaScript
 * Lightweight, vanilla JavaScript for responsive navigation, product forms, and interactions.
 */

const PRICE_PER_CM3 = 0.002; // Change this value to update the custom case price.
const BASE_PRICE = 0.01; // The 1-cent Shopify base product.

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
  const cornerOptions = [
    { id: 'plastic', label: 'Standard Plastic', price: 0 },
    { id: 'metal', label: '1 cm Aluminum Cubes', price: 9.99 }
  ];
  let customPricing = pricingFallback;
  let manualRotation = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = null;

  const defaultState = {
    step: 0,
    object: '',
    width: 20,
    depth: 16,
    height: 20,
    panels: { base: 'gloss-black', back: 'transparent', top: 'transparent', left: 'transparent', right: 'transparent', front: 'transparent' },
    cornerType: 'plastic',
    engraving: false,
    led: false,
    raised: false,
    rotating: false,
    engravingText: ''
  };

  const MIN_DIMENSION = 5;
  const MAX_DIMENSION = 200;
  const clampDimension = (value, min, max) => Math.min(Math.max(Number(value) || min, min), max);

  function readState() {
    const saved = JSON.parse(localStorage.getItem('ecrinlux-bespoke') || 'null') || defaultState;
    const params = new URLSearchParams(window.location.search);
    return {
      ...defaultState,
      ...saved,
      object: params.get('object') || saved.object || defaultState.object,
      width: clampDimension(params.get('width') || saved.width || defaultState.width, MIN_DIMENSION, MAX_DIMENSION),
      depth: clampDimension(params.get('depth') || saved.depth || defaultState.depth, MIN_DIMENSION, MAX_DIMENSION),
      height: clampDimension(params.get('height') || saved.height || defaultState.height, MIN_DIMENSION, MAX_DIMENSION),
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

  function getVolumeCm3(state) {
    const volume = Number(state.width) * Number(state.depth) * Number(state.height);
    return Math.max(1, Number(Math.round(volume || 1)));
  }

  function getPricing(state) {
    const volumeCm3 = getVolumeCm3(state);
    const totalPrice = volumeCm3 * PRICE_PER_CM3;
    const quantity = Math.ceil(totalPrice / BASE_PRICE);
    const displayPrice = (quantity * BASE_PRICE).toFixed(2);
    return Number(displayPrice);
  }

  function getCartPricing(state) {
    const volumeCm3 = getVolumeCm3(state);
    const totalPrice = volumeCm3 * PRICE_PER_CM3;
    const quantity = Math.ceil(totalPrice / BASE_PRICE);
    const displayPrice = (quantity * BASE_PRICE).toFixed(2);
    return { totalPrice, quantity, displayPrice };
  }

  function updatePreview(state) {
    const palette = {
      transparent: 'rgba(185, 210, 255, 0.14)',
      'gloss-black': 'rgba(8, 11, 14, 0.96)',
      'noir-profond': 'rgba(23, 26, 29, 0.78)',
      'fume': 'rgba(142, 152, 168, 0.72)',
      'blanc-opale': 'rgba(242, 243, 244, 0.72)',
      'bleu-nuit': 'rgba(44, 77, 130, 0.7)',
      'rouge-carmin': 'rgba(111, 29, 27, 0.7)',
      'vert-racing': 'rgba(41, 88, 64, 0.7)',
      'or-miroir': 'rgba(185, 147, 52, 0.75)',
      'argent-miroir': 'rgba(168, 177, 187, 0.7)'
    };

    Object.entries(state.panels).forEach(([key, value]) => {
      const face = caseElement.querySelector(`[data-panel-face="${key}"]`);
      if (face) {
        const color = palette[value] || palette.transparent;
        face.style.background = color;
        face.style.borderColor = value === 'transparent' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)';
        face.style.boxShadow = value === 'transparent'
          ? 'inset 0 0 18px rgba(215,227,255,0.25), 0 0 0 1px rgba(255,255,255,0.08)'
          : value === 'gloss-black'
            ? 'inset 0 0 20px rgba(255,255,255,0.05), 0 12px 24px rgba(0,0,0,0.35)'
            : 'inset 0 0 18px rgba(255,255,255,0.1), 0 18px 28px rgba(0,0,0,0.18)';
        face.style.opacity = '0.96';
      }
    });

    const widthScale = (Number(state.width) / 200) * 1.2;
    const depthScale = (Number(state.depth) / 200) * 1.1;
    const heightScale = (Number(state.height) / 200) * 1.2;
    const widthPx = Math.round(80 + widthScale * 180);
    const depthPx = Math.round(70 + depthScale * 150);
    const heightPx = Math.round(80 + heightScale * 180);

    caseElement.style.setProperty('--case-width', `${widthPx}px`);
    caseElement.style.setProperty('--case-depth', `${depthPx}px`);
    caseElement.style.setProperty('--case-height', `${heightPx}px`);

    const clampedX = Math.min(Math.max((manualRotation.x || 0), -45), 45);
    const clampedY = Math.min(Math.max((manualRotation.y || 0), -45), 45);
    caseElement.style.transform = `rotateX(${clampedX}deg) rotateY(${clampedY}deg) scale(1.08)`;

    const { displayPrice } = getCartPricing(state);
    const price = Number(displayPrice);
    const priceEstimate = builderSection.querySelector('#builderPriceEstimate');
    const dimensionPriceEstimate = builderSection.querySelector('#dimensionPriceEstimate');
    const summaryPrice = builderSection.querySelector('#summaryPrice');
    if (priceEstimate) priceEstimate.textContent = `Estimation : ${formatCurrency(price)}`;
    if (dimensionPriceEstimate) dimensionPriceEstimate.textContent = `Prix estimé : ${formatCurrency(price)}`;
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
      width: clampDimension(widthValue, MIN_DIMENSION, MAX_DIMENSION),
      depth: clampDimension(depthValue, MIN_DIMENSION, MAX_DIMENSION),
      height: clampDimension(heightValue, MIN_DIMENSION, MAX_DIMENSION)
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

  async function loadPricing() {
    if (!pricingUrl) return;
    try {
      const response = await fetch(pricingUrl, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (data && data.baseRate) {
        customPricing = { ...pricingFallback, ...data, panelCosts: { ...pricingFallback.panelCosts, ...(data.panelCosts || {}) } };
      }
    } catch (error) {
      customPricing = pricingFallback;
    }
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
    dragStart = {
      x: event.clientX,
      y: event.clientY,
      rotationX: manualRotation.x,
      rotationY: manualRotation.y
    };
    previewFrame.setPointerCapture(event.pointerId);
  });

  previewFrame.addEventListener('pointermove', (event) => {
    if (!isDragging || !dragStart) return;
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    manualRotation.y = Math.min(Math.max(dragStart.rotationY + deltaX * 0.25, -45), 45);
    manualRotation.x = Math.min(Math.max(dragStart.rotationX - deltaY * 0.2, -45), 45);
    const state = gatherCurrentInputState();
    updatePreview(state);
  });

  previewFrame.addEventListener('pointerup', () => {
    isDragging = false;
    dragStart = null;
  });

  previewFrame.addEventListener('pointerleave', () => {
    isDragging = false;
    dragStart = null;
  });

  builderSection.querySelectorAll('.stepper-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.target;
      const input = builderSection.querySelector(`#${key}Input`);
      const currentValue = Number(input.value || 0);
      const delta = button.dataset.action === 'increase' ? 1 : -1;
      const minValue = key === 'width' ? MIN_DIMENSION : key === 'depth' ? MIN_DIMENSION : MIN_DIMENSION;
      const maxValue = key === 'width' ? MAX_DIMENSION : key === 'depth' ? MAX_DIMENSION : MAX_DIMENSION;
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
    const baseProductId = Number(builderSection.dataset.customProductId || 0);
    const variantId = Number(builderSection.dataset.customVariantId || 0) || baseProductId || null;
    const volume = getVolumeCm3(state);
    const { quantity, displayPrice } = getCartPricing(state);
    const selectedCorner = cornerOptions.find((option) => option.id === state.cornerType) || cornerOptions[0];
    const configurationPayload = {
      object: state.object || 'Sur mesure',
      width: Number(state.width),
      depth: Number(state.depth),
      height: Number(state.height),
      volumeCm3: volume,
      panels: state.panels,
      cornerType: selectedCorner.label,
      price: Number(displayPrice),
      currency: 'EUR'
    };

    notice.textContent = `Votre écrin ${state.object || 'sur mesure'} a été estimé à ${formatCurrency(price)}. ${variantId ? 'Le produit est prêt à être ajouté au panier.' : 'Configurez le produit personnalisé dans Shopify pour compléter l’ajout au panier.'}`;
    localStorage.setItem('ecrinlux-bespoke', JSON.stringify({ ...state, step: 4, finalPrice: price, volumeCm3: volume }));

    if (!variantId) {
      return;
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity,
        properties: {
          Objet: state.object || 'Sur mesure',
          Dimensions: `${Number(state.width)} x ${Number(state.depth)} x ${Number(state.height)} cm`,
          'Volume cm³': `${volume}`,
          'Corner Type': selectedCorner.label,
          'Bottom Panel': state.panels.base || 'Gloss Black',
          'Top Panel': state.panels.top || 'Transparent',
          'Front Panel': state.panels.front || 'Transparent',
          'Back Panel': state.panels.back || 'Transparent',
          'Left Panel': state.panels.left || 'Transparent',
          'Right Panel': state.panels.right || 'Transparent',
          'Prix estimé': formatCurrency(Number(displayPrice)),
          'Configuration finale': JSON.stringify(configurationPayload)
        }
      })
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

  loadPricing();
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
