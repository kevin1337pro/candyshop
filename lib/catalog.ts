export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  position: string;
  tag: string;
  description: string;
  ingredients: string;
};
export const products: Product[] = [
  {
    id: 1,
    name: 'Rainbow Bears',
    category: 'Süßigkeiten',
    price: 490,
    unit: '200 g',
    position: '0% 0%',
    tag: 'FRUCHTIG',
    description:
      'Kleine Bären. Große Candy-Laune. Ein bunter Fruchtgummi-Mix für deine süße Auszeit.',
    ingredients:
      'Dies ist ein Beispielprodukt. Verbindliche Zutaten, Allergene und Nährwerte werden zum Shopstart ergänzt.',
  },
  {
    id: 2,
    name: 'Sour Rainbow Belts',
    category: 'Süßigkeiten',
    price: 390,
    unit: '150 g',
    position: '100% 0%',
    tag: 'SOUR POWER',
    description:
      'Bunt, weich und extra sauer gedacht: Regenbogenbänder für alle, die es nicht nur süß mögen.',
    ingredients:
      'Dies ist ein Beispielprodukt. Verbindliche Zutaten, Allergene und Nährwerte werden zum Shopstart ergänzt.',
  },
  {
    id: 3,
    name: 'Double Choco Cookie',
    category: 'Snacks',
    price: 350,
    unit: '1 Stück',
    position: '0% 100%',
    tag: 'CHOCO LOVE',
    description:
      'Dein kleiner Schokoladenmoment. Ein dunkler Cookie mit großen Schokostücken – perfekt für die Snackpause.',
    ingredients:
      'Beispielprodukt: Allergene und Zutaten sind noch nicht freigegeben. Nicht als allergenfrei betrachten.',
  },
  {
    id: 4,
    name: 'Blue Raspberry',
    category: 'Drinks',
    price: 450,
    unit: '400 ml',
    position: '100% 100%',
    tag: 'STAY COOL',
    description:
      'Eiskalt, knallig blau und voller Summer-Vibes. Ein fruchtiger Drink als Begleitung zu deinem Candy-Mix.',
    ingredients:
      'Dies ist ein Beispielprodukt. Zutaten, Nährwerte und verbindliche Getränkeinformationen folgen zum Shopstart.',
  },
];
export type CartItem = { id: number; qty: number };
export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const map = new Map<number, number>();
  for (const item of value) {
    if (
      !item ||
      !products.some((p) => p.id === item.id) ||
      !Number.isInteger(item.qty) ||
      item.qty < 1
    )
      continue;
    map.set(item.id, Math.min(20, (map.get(item.id) || 0) + item.qty));
  }
  return Array.from(map, ([id, qty]) => ({ id, qty }));
}
export function cartSubtotal(cart: CartItem[]) {
  return cart.reduce(
    (total, item) =>
      total + (products.find((p) => p.id === item.id)?.price || 0) * item.qty,
    0,
  );
}
