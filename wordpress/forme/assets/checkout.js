/* Use the supported WooCommerce Blocks filter, not DOM text replacement. */
(function () {
  if (!window.wc || !window.wc.blocksCheckout) return;
  window.wc.blocksCheckout.registerCheckoutFilters('candy-corner', {
    placeOrderButtonLabel: function () { return 'Zahlungspflichtig bestellen'; }
  });
}());
