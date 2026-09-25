(function () {
  'use strict';
  var toggle = document.querySelector('[data-menu-toggle]'),
    nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
      nav.classList.toggle('menu-is-open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (
        e.key === 'Escape' &&
        toggle.getAttribute('aria-expanded') === 'true'
      ) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Menü öffnen');
        nav.classList.remove('menu-is-open');
        toggle.focus();
      }
    });
  }
  var form = document.querySelector('[data-candy-order]');
  if (!form) return;
  var postcode = form.querySelector('[name=postcode]'),
    feedback = form.querySelector('[data-order-feedback]'),
    button = form.querySelector('[data-order-submit]'),
    shop = form.querySelector('[data-order-shop]');
  var version = 0;
  function selectedMode() {
    return form.querySelector('[name=mode]:checked').value;
  }
  form.querySelectorAll('[name=mode]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      version++;
      var pickup = selectedMode() === 'pickup';
      form.querySelector('[data-delivery-field]').hidden = pickup;
      form.querySelector('[data-pickup-field]').hidden = !pickup;
      form.querySelector('[data-delivery-cost]').hidden = pickup;
      form.querySelector('[data-pickup-cost]').hidden = !pickup;
      postcode.required = !pickup;
      button.textContent = pickup
        ? 'Abholung auswählen'
        : 'Liefergebiet prüfen';
      button.disabled = false;
      feedback.textContent = '';
      shop.hidden = true;
    });
  });
  postcode.addEventListener('input', function () {
    version++;
    feedback.textContent = '';
    shop.hidden = true;
    button.disabled = false;
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var attempt = ++version;
    shop.hidden = true;
    feedback.textContent = 'Wird geprüft …';
    button.disabled = true;
    try {
      if (typeof candyDelivery === 'undefined') throw new Error('setup');
      var data = new FormData(form);
      data.append('nonce', candyDelivery.nonce);
      var response = await fetch(candyDelivery.url, {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
      });
      var json = await response.json();
      if (attempt !== version) return;
      if (!response.ok || !json.success) throw new Error('request');
      feedback.textContent = json.data.message;
      shop.hidden = !json.data.available;
    } catch (error) {
      if (attempt === version)
        feedback.textContent =
          'Die Prüfung ist gerade nicht möglich. Bitte lade die Seite neu oder versuche es später erneut.';
    } finally {
      if (attempt === version) button.disabled = false;
    }
  });
})();
