/**
 * Shopify Starter Theme JavaScript
 * Lightweight, vanilla JavaScript for responsive navigation, product forms, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initVariantSelectors();
  initRevealAnimations();
  initScrollCue();
});

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
