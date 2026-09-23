(function () {
  'use strict';
  var modal = document.getElementById('candy-age-dialog');
  if (!modal || typeof candyAge === 'undefined') return;
  var confirmed = candyAge.confirmed,
    pending = null,
    returnFocus = null;
  function ask(action, target) {
    pending = action;
    returnFocus = target;
    modal.querySelector('[data-age-error]').textContent = '';
    modal.showModal();
    modal.querySelector('[data-age-no]').focus();
  }
  document.addEventListener(
    'click',
    function (event) {
      if (confirmed) return;
      var target = event.target.closest(
        '[data-candy-age], .candy-age-notice a.woocommerce-LoopProduct-link, .candy-age-notice .single_add_to_cart_button',
      );
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      ask(function () {
        target.click();
      }, target);
    },
    true,
  );
  document.addEventListener(
    'submit',
    function (event) {
      if (confirmed || !event.target.matches('.candy-age-notice form.cart'))
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var form = event.target,
        submitter = event.submitter;
      ask(function () {
        form.requestSubmit(submitter || undefined);
      }, submitter || form);
    },
    true,
  );
  modal.querySelector('[data-age-no]').addEventListener('click', function () {
    pending = null;
    modal.close();
  });
  modal.addEventListener('cancel', function () {
    pending = null;
  });
  modal.addEventListener('close', function () {
    if (returnFocus) returnFocus.focus();
  });
  modal
    .querySelector('[data-age-yes]')
    .addEventListener('click', async function () {
      var button = this;
      button.disabled = true;
      try {
        var response = await fetch(candyAge.url, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            nonce: candyAge.nonce,
            confirmed: 'yes',
          }),
        });
        var result = await response.json();
        if (!response.ok || !result.success) throw new Error('failed');
        confirmed = true;
        var action = pending;
        pending = null;
        modal.close();
        if (action) action();
      } catch (_) {
        modal.querySelector('[data-age-error]').textContent =
          'Bitte lade die Seite neu und versuche es erneut.';
      } finally {
        button.disabled = false;
      }
    });
})();
