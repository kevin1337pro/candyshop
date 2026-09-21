(function () {
 'use strict';
 var toggle = document.querySelector('[data-menu-toggle]');
 var nav = document.getElementById('primary-nav');
 if (toggle && nav) {
  toggle.addEventListener('click', function () {
   var expanded = toggle.getAttribute('aria-expanded') === 'true';
   toggle.setAttribute('aria-expanded', String(!expanded));
   nav.classList.toggle('menu-is-open', !expanded);
  });
  document.addEventListener('keydown', function (event) {
   if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('menu-is-open'); toggle.focus();
   }
  });
 }
})();
