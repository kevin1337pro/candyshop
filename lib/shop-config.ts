import essenPostcodes from '../wordpress/forme/data/essen-postcodes.json';
// Gemeinsame Essener PLZ-Liste für Vorschau und WordPress. Beträge in Cent.
export const shopConfig = {
  name: 'Candy Corner',
  pickupLabel: 'Essen-Zentrum',
  pickupAddress: '',
  minimum: 2000,
  deliveryFee: 500,
  deliveryPostcodes: essenPostcodes,
  domain: 'www.candycorner-essen.de',
  paymentLabel: 'Barzahlung bei Übergabe',
} as const;
export const money = (cents: number) =>
  (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
export function checkPostcode(raw: string) {
  const postcode = raw.trim();
  if (!/^\d{5}$/.test(postcode))
    return {
      available: false,
      status: 'invalid',
      message: 'Bitte gib eine gültige fünfstellige Postleitzahl ein.',
    };
  if (!shopConfig.deliveryPostcodes.length)
    return {
      available: false,
      status: 'unconfigured',
      message:
        'Unser Liefergebiet wird gerade eingerichtet. Entdecke schon das Sortiment – eine Lieferzusage ist noch nicht möglich.',
    };
  const available = shopConfig.deliveryPostcodes.includes(postcode);
  return {
    available,
    status: available ? 'available' : 'unavailable',
    message: available
      ? `Wir liefern persönlich nach ${postcode} Essen. Du bezahlst bar bei Übergabe.`
      : 'Diese Adresse liegt außerhalb unseres Lieferbereichs in Essen. Eine Lieferbestellung ist für diese PLZ nicht möglich.',
  };
}
