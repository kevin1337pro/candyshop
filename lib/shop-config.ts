// Beträge in Cent. Liefer-PLZ erst nach Freigabe des tatsächlichen Liefergebiets eintragen.
export const shopConfig = {
  name: 'Candy Corner',
  pickupLabel: 'Essen-Zentrum',
  pickupAddress: '',
  minimum: 2000,
  deliveryFee: 500,
  deliveryPostcodes: [] as string[],
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
      ? `Gute Nachrichten! Wir liefern nach ${postcode}.`
      : 'Diese PLZ liegt außerhalb unseres Liefergebiets. Wähle alternativ Abholung in Essen-Zentrum.',
  };
}
