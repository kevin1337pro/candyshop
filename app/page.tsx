'use client';
import Image from 'next/image';
import {
  ArrowUpRight,
  MapPin,
  ShoppingBag,
  Truck,
  Store,
  ArrowRight,
  Sparkles,
  Search,
  Plus,
  Minus,
  X,
  Candy,
  Cookie,
  CupSoda,
  Check,
  Heart,
  Package,
} from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { shopConfig, checkPostcode, money } from '@/lib/shop-config';
import {
  products,
  normalizeCart,
  cartSubtotal,
  type CartItem,
  type Product,
} from '@/lib/catalog';
const CART_KEY = 'candy-corner-cart-v1';
const emptyCart: CartItem[] = [];
let storedCart: CartItem[] = emptyCart;
let loaded = false;
const listeners = new Set<() => void>();
function getCart() {
  if (!loaded && typeof window !== 'undefined') {
    loaded = true;
    try {
      storedCart = normalizeCart(
        JSON.parse(localStorage.getItem(CART_KEY) || '[]'),
      );
    } catch {
      storedCart = [];
    }
  }
  return storedCart;
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function saveCart(cart: CartItem[]) {
  storedCart = normalizeCart(cart);
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(storedCart));
  } catch {
    /* Current tab stays usable when browser storage is blocked. */
  }
  listeners.forEach((fn) => fn());
}
function ProductImage({
  product,
  className = '',
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div className={`product-image ${className}`}>
      <Image
        unoptimized
        src="/images/candy-products.png"
        alt={`${product.name} – KI-Beispielbild`}
        width={1254}
        height={1254}
        style={{
          left: product.position.startsWith('100') ? '-100%' : '0',
          top: product.position.endsWith('100%') ? '-100%' : '0',
        }}
      />
    </div>
  );
}
export default function Home() {
  const cart = useSyncExternalStore(subscribe, getCart, () => emptyCart);
  const [mode, setMode] = useState('delivery');
  const [postcode, setPostcode] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Alle');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState<Product | null>(null);
  const [info, setInfo] = useState('');
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === CART_KEY) {
        try {
          storedCart = normalizeCart(JSON.parse(event.newValue || '[]'));
        } catch {
          storedCart = [];
        }
        listeners.forEach((fn) => fn());
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);
  const shown = useMemo(() => {
    const result = products.filter(
      (p) =>
        (category === 'Alle' || p.category === category) &&
        (!onlyFavorites || favorites.includes(p.id)) &&
        `${p.name} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    );
    return sort === 'low'
      ? result.sort((a, b) => a.price - b.price)
      : sort === 'high'
        ? result.sort((a, b) => b.price - a.price)
        : result;
  }, [category, query, sort, favorites, onlyFavorites]);
  const count = cart.reduce((n, item) => n + item.qty, 0);
  const subtotal = cartSubtotal(cart);
  const remaining = Math.max(0, shopConfig.minimum - subtotal);
  const shipping =
    mode === 'delivery' && subtotal > 0 ? shopConfig.deliveryFee : 0;
  const add = (p: Product) => {
    const old = getCart();
    if ((old.find((x) => x.id === p.id)?.qty || 0) >= 20) {
      setToast('Maximal 20 Stück je Artikel in der Vorschau.');
      return;
    }
    saveCart(normalizeCart([...old, { id: p.id, qty: 1 }]));
    setToast(`${p.name} ist in deinem Warenkorb.`);
  };
  const changeQty = (id: number, delta: number) =>
    saveCart(
      getCart()
        .map((x) =>
          x.id === id ? { ...x, qty: Math.min(20, x.qty + delta) } : x,
        )
        .filter((x) => x.qty > 0),
    );
  const reset = () => {
    setCategory('Alle');
    setQuery('');
    setOnlyFavorites(false);
  };
  const chooseCategory = (cat: string) => {
    setCategory(cat);
    setOnlyFavorites(false);
    document
      .getElementById('sortiment')
      ?.scrollIntoView({ behavior: 'smooth' });
  };
  const favorite = (id: number) =>
    setFavorites((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <div className="announcement">
        <span>DEIN CANDY-SPOT IN ESSEN</span>
        <span>
          <Truck size={14} /> Lieferung & Abholung{' '}
          <span className="announcement-dot">✦</span> Ab{' '}
          {money(shopConfig.minimum)} Bestellwert
        </span>
      </div>
      <header className="site-header wrap">
        <a href="#top" className="brand" aria-label="Candy Corner – Startseite">
          <Image
            unoptimized
            src="/images/candy-corner-logo.png"
            alt="Candy Corner"
            width="1536"
            height="1024"
          />
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="#sortiment">Unser Sortiment</a>
          <a href="#so-gehts">So funktioniert’s</a>
          <a href="#fragen">Gut zu wissen</a>
        </nav>
        <div className="header-actions">
          <button
            className="favorite-link"
            aria-label="Merkliste anzeigen"
            onClick={() => {
              setOnlyFavorites(true);
              setCategory('Alle');
              setQuery('');
              document
                .getElementById('sortiment')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Heart size={21} />
            {favorites.length > 0 && <span>{favorites.length}</span>}
          </button>
          <button className="bag-button" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} />
            <span className="bag-label">Warenkorb</span>
            <b>{count}</b>
          </button>
        </div>
      </header>
      <main id="main">
        <section
          className="order-panel wrap"
          id="bestellen"
          aria-labelledby="order-heading"
        >
          <div className="order-intro">
            <span className="eyebrow pink">LET’S GET SWEET</span>
            <h2 id="order-heading">
              Wie kommt dein
              <br />
              Glück zu dir?
            </h2>
            <p>Liefern lassen oder selbst abholen.</p>
          </div>
          <div className="order-form">
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(String(v));
                setMessage('');
              }}
            >
              <TabsList className="fulfillment-tabs" aria-label="Bestellart">
                <TabsTrigger value="delivery">
                  <Truck size={19} />
                  Lieferung
                </TabsTrigger>
                <TabsTrigger value="pickup">
                  <Store size={19} />
                  Abholung
                </TabsTrigger>
              </TabsList>
              <TabsContent value="delivery">
                <form
                  className="postcode-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMessage(checkPostcode(postcode).message);
                  }}
                >
                  <label className="postcode-input">
                    <MapPin size={20} />
                    <span className="sr-only">Deine Postleitzahl</span>
                    <input
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                      placeholder="Deine Postleitzahl"
                      value={postcode}
                      onChange={(e) => {
                        setPostcode(e.target.value.replace(/\D/g, ''));
                        setMessage('');
                      }}
                      required
                      pattern="[0-9]{5}"
                      title="Bitte eine fünfstellige Postleitzahl eingeben"
                      aria-describedby="delivery-feedback"
                    />
                  </label>
                  <button className="button primary" type="submit">
                    Liefergebiet prüfen <ArrowRight size={19} />
                  </button>
                </form>
                <p className="order-meta">
                  {money(shopConfig.minimum)} Mindestbestellwert <span>·</span>{' '}
                  {money(shopConfig.deliveryFee)} Lieferkosten
                </p>
              </TabsContent>
              <TabsContent value="pickup">
                <div className="pickup-row">
                  <div className="pickup-panel">
                    <MapPin size={25} />
                    <div>
                      <strong>{shopConfig.pickupLabel}</strong>
                      <p>
                        {shopConfig.pickupAddress ||
                          'Die genaue Abholadresse folgt zum Shopstart.'}
                      </p>
                    </div>
                  </div>
                  <a className="button primary" href="#sortiment">
                    Snacks aussuchen <ArrowRight size={19} />
                  </a>
                </div>
                <p className="order-meta">
                  Abholung ohne Lieferkosten <span>·</span>{' '}
                  {money(shopConfig.minimum)} Mindestbestellwert
                </p>
              </TabsContent>
            </Tabs>
            <output className="form-feedback" id="delivery-feedback">
              {message}
            </output>
          </div>
        </section>
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="cyan-dot" /> GOOD MOOD. GREAT CANDY.
            </span>
            <h1>
              Dein Leben.
              <br />
              Ein bisschen <em>süßer.</em>
            </h1>
            <p>
              Süß, sauer, crunchy. Entdecke deinen nächsten Lieblingssnack – für
              die Couch, die Crew und einfach so.
            </p>
            <a className="button primary hero-cta" href="#sortiment">
              Entdecke deine Lieblinge <ArrowUpRight size={21} />
            </a>
            <div className="hero-caption">
              <MapPin size={15} />
              <span>Sweet vibes. Made for Essen.</span>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              unoptimized
              src="/images/candy-hero.png"
              alt="Bunte Fruchtgummis und saure Bänder in einer schwarzen Candy-Box"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <span className="hero-stamp">
              SWEET
              <br />
              <b>VIBES</b>
              <Sparkles size={20} />
            </span>
            <span className="image-caption">LITTLE TREATS. BIG ENERGY.</span>
          </div>
        </section>
        <div className="values-strip wrap">
          <span>
            <Candy size={21} /> Von süß bis extra sauer
          </span>
          <span>
            <Store size={21} /> Dein Candy-Spot in Essen
          </span>
          <span>
            <Package size={21} /> Dein Mix. Dein Moment.
          </span>
        </div>
        <section className="catalog wrap" id="sortiment">
          <div className="section-heading">
            <div>
              <span className="eyebrow pink">PICK YOUR HAPPY</span>
              <h2>Was darf’s für dich sein?</h2>
            </div>
            <p>Finde deinen nächsten Snack-Crush.</p>
          </div>
          <div className="catalog-tools">
            <fieldset className="category-tabs">
              <legend className="sr-only">Produktkategorien</legend>
              {[
                { name: 'Alle', icon: Sparkles },
                { name: 'Süßigkeiten', icon: Candy },
                { name: 'Snacks', icon: Cookie },
                { name: 'Drinks', icon: CupSoda },
              ].map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className={
                    category === name && !onlyFavorites ? 'active' : ''
                  }
                  onClick={() => {
                    setCategory(name);
                    setOnlyFavorites(false);
                  }}
                  aria-pressed={category === name && !onlyFavorites}
                >
                  <Icon size={17} />
                  {name}
                </button>
              ))}
              {onlyFavorites && (
                <button className="active" onClick={reset}>
                  <Heart size={17} /> Merkliste <X size={14} />
                </button>
              )}
            </fieldset>
            <label className="catalog-search">
              <Search size={18} />
              <span className="sr-only">Sortiment durchsuchen</span>
              <input
                type="search"
                placeholder="Dein Lieblingssnack …"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="catalog-meta">
            <span aria-live="polite">
              {shown.length} {shown.length === 1 ? 'Liebling' : 'Lieblinge'} zum
              Entdecken
            </span>
            <label>
              Sortieren:{' '}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Unsere Auswahl</option>
                <option value="low">Preis aufsteigend</option>
                <option value="high">Preis absteigend</option>
              </select>
            </label>
          </div>
          {shown.length ? (
            <div className="product-grid">
              {shown.map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="product-visual">
                    <button
                      className="product-open"
                      aria-label={`${p.name} ansehen`}
                      onClick={() => setDetail(p)}
                    >
                      <ProductImage product={p} />
                    </button>
                    <span className={`product-tag tag-${p.id}`}>{p.tag}</span>
                    <button
                      className={`favorite-button ${favorites.includes(p.id) ? 'saved' : ''}`}
                      aria-label={`${p.name} ${favorites.includes(p.id) ? 'aus Merkliste entfernen' : 'merken'}`}
                      aria-pressed={favorites.includes(p.id)}
                      onClick={() => favorite(p.id)}
                    >
                      <Heart
                        size={18}
                        fill={
                          favorites.includes(p.id) ? 'currentColor' : 'none'
                        }
                      />
                    </button>
                  </div>
                  <div className="product-meta">
                    <span>
                      {p.category} <span>·</span> {p.unit}
                    </span>
                    <button
                      onClick={() => setDetail(p)}
                      className="product-name"
                    >
                      {p.name}
                    </button>
                    <div className="product-bottom">
                      <strong>{money(p.price)}</strong>
                      <button
                        className="quick-add"
                        onClick={() => add(p)}
                        aria-label={`${p.name} in den Warenkorb`}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>
                {onlyFavorites
                  ? 'Deine Merkliste wartet auf Lieblinge.'
                  : 'Noch nicht dein Sweet Spot?'}
              </h3>
              <p>
                {onlyFavorites
                  ? 'Tippe auf das Herz an einem Produkt, um es hier zu merken.'
                  : 'Für diese Suche gibt es keine passenden Snacks.'}
              </p>
              <button className="button primary" onClick={reset}>
                Alle Snacks entdecken <ArrowRight size={18} />
              </button>
            </div>
          )}
          <p className="catalog-note">
            Sortimentsvorschau · Beispielprodukte und Beispielpreise ·
            KI-generierte Produktbilder
          </p>
        </section>
        <section className="mood-banner wrap">
          <div>
            <span className="eyebrow cyan">
              DEIN ABEND HAT WAS BESSERES VOR.
            </span>
            <h2>
              Couch. Crew.
              <br />
              <span>Candy Corner.</span>
            </h2>
            <p>
              Lieblingsserie an. Lieblingssnacks dazu.
              <br />
              Stell dir deinen ganz eigenen Sweet Mix zusammen.
            </p>
            <button
              className="button light"
              onClick={() => chooseCategory('Süßigkeiten')}
            >
              Candy-Mix entdecken <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="mood-art">
            <Image
              unoptimized
              src="/images/candy-corner-logo.png"
              alt="Candy Corner"
              width="1536"
              height="1024"
              loading="lazy"
            />
          </div>
        </section>
        <section className="how-section wrap" id="so-gehts">
          <div>
            <span className="eyebrow cyan">DEIN SNACK. DEIN WEG.</span>
            <h2>
              Von „Lust auf was Süßes“
              <br />
              zu „genau das“.
            </h2>
            <a className="text-link" href="#bestellen">
              Lieferung oder Abholung wählen <ArrowUpRight size={20} />
            </a>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>Zu dir oder zu uns?</h3>
                <p>
                  Wähle Lieferung und prüfe deine PLZ. Oder entscheide dich für
                  Abholung in Essen-Zentrum.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Lieblinge aussuchen</h3>
                <p>
                  Süßigkeiten, Snacks und Drinks – ab{' '}
                  {money(shopConfig.minimum)} Bestellwert.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Vorfreude an. Alltag aus.</h3>
                <p>
                  Bei Lieferung kommen {money(shopConfig.deliveryFee)} dazu. Bei
                  Abholung entfallen die Lieferkosten.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="faq-section wrap" id="fragen">
          <div>
            <span className="eyebrow pink">NOCH FRAGEN?</span>
            <h2>Gut zu wissen.</h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>Wohin liefert Candy Corner?</summary>
              <p>
                Unser Liefergebiet wird zum Shopstart festgelegt. Mit der
                PLZ-Prüfung oben kannst du nach Freischaltung sehen, ob wir zu
                dir liefern. Aktuell geben wir noch keine Lieferzusage.
              </p>
            </details>
            <details>
              <summary>
                Wie hoch sind Mindestbestellwert und Lieferkosten?
              </summary>
              <p>
                Der Mindestbestellwert beträgt {money(shopConfig.minimum)} ohne
                Lieferkosten. Bei Lieferung berechnen wir zusätzlich{' '}
                {money(shopConfig.deliveryFee)}. Bei Abholung entfallen die
                Lieferkosten.
              </p>
            </details>
            <details>
              <summary>Wo kann ich meine Bestellung abholen?</summary>
              <p>
                Geplant ist die Abholung in Essen-Zentrum. Die genaue Anschrift
                und Abholzeiten werden zum Shopstart bekannt gegeben.
              </p>
            </details>
            <details>
              <summary>Kann ich schon bestellen?</summary>
              <p>
                Du kannst das Sortiment ausprobieren, Lieblinge merken und
                deinen Warenkorb zusammenstellen. Diese Seite ist eine
                Designvorschau. Es werden noch keine Bestellungen oder Zahlungen
                angenommen.
              </p>
            </details>
            <details>
              <summary>Wo finde ich Zutaten und Allergene?</summary>
              <p>
                Das aktuelle Sortiment zeigt Beispielprodukte. Verbindliche
                Zutaten, Allergene und Nährwerte werden vor dem Verkaufsstart
                bei den echten Produkten ergänzt.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <div className="footer-top">
          <div>
            <a className="brand" href="#top">
              <Image
                unoptimized
                src="/images/candy-corner-logo.png"
                alt="Candy Corner – Startseite"
                width="1536"
                height="1024"
                loading="lazy"
              />
            </a>
            <p>
              Dein Sweet Spot in Essen.
              <br />
              Ein bisschen bunter. Ein bisschen süßer.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <h3>Entdecken</h3>
              <button onClick={() => chooseCategory('Süßigkeiten')}>
                Süßigkeiten
              </button>
              <button onClick={() => chooseCategory('Snacks')}>Snacks</button>
              <button onClick={() => chooseCategory('Drinks')}>Drinks</button>
            </div>
            <div>
              <h3>Dein Candy Corner</h3>
              <a href="#bestellen">Lieferung & Abholung</a>
              <a href="#fragen">Häufige Fragen</a>
              <button onClick={() => setInfo('Kontakt')}>Kontakt</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Candy Corner</span>
          <span className="preview-badge">
            Designvorschau · Noch kein Verkauf
          </span>
          <div>
            <button onClick={() => setInfo('Impressum')}>Impressum</button>
            <button onClick={() => setInfo('Datenschutz')}>Datenschutz</button>
          </div>
        </div>
      </footer>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="shop-sheet">
          <SheetHeader>
            <SheetTitle>
              Deine süße Auszeit <span className="pink">({count})</span>
            </SheetTitle>
            <SheetDescription>
              Dein Warenkorb · {mode === 'delivery' ? 'Lieferung' : 'Abholung'}
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-body cart-body">
            {!cart.length ? (
              <div className="empty-state">
                <ShoppingBag size={38} />
                <h3>Hier ist noch Platz für Glück.</h3>
                <p>Fülle deinen Warenkorb mit deinen Lieblingssnacks.</p>
                <button
                  className="button primary"
                  onClick={() => {
                    setCartOpen(false);
                    document
                      .getElementById('sortiment')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Snacks entdecken <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => {
                  const p = products.find((p) => p.id === item.id)!;
                  return (
                    <div className="cart-item" key={item.id}>
                      <ProductImage product={p} />
                      <div>
                        <h3>{p.name}</h3>
                        <p>
                          {p.unit} · {money(p.price)} / Artikel
                        </p>
                        <strong>{money(p.price * item.qty)}</strong>
                        <div className="quantity">
                          <button
                            aria-label={`Ein ${p.name} weniger`}
                            onClick={() => changeQty(p.id, -1)}
                          >
                            <Minus size={15} />
                          </button>
                          <span aria-label="Menge">{item.qty}</span>
                          <button
                            disabled={item.qty >= 20}
                            aria-label={`Ein ${p.name} mehr`}
                            onClick={() => changeQty(p.id, 1)}
                          >
                            <Plus size={15} />
                          </button>
                          <button
                            className="remove-item"
                            onClick={() =>
                              saveCart(getCart().filter((x) => x.id !== p.id))
                            }
                            aria-label={`${p.name} entfernen`}
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="minimum-progress">
                  <p>
                    {remaining
                      ? `Noch ${money(remaining)} bis zum Mindestbestellwert.`
                      : 'Mindestbestellwert erreicht. Sweet!'}
                  </p>
                  <progress
                    max={shopConfig.minimum}
                    value={Math.min(subtotal, shopConfig.minimum)}
                    aria-label="Fortschritt zum Mindestbestellwert"
                  />
                </div>
              </>
            )}
          </div>
          {cart.length > 0 && (
            <div className="cart-summary">
              <div>
                <span>Zwischensumme</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div>
                <span>{mode === 'delivery' ? 'Lieferkosten' : 'Abholung'}</span>
                <span>{money(shipping)}</span>
              </div>
              <div className="cart-total">
                <strong>Gesamt</strong>
                <strong>{money(subtotal + shipping)}</strong>
              </div>
              <p>
                Beispielpreise.{' '}
                {mode === 'delivery'
                  ? 'Verfügbarkeit hängt vom Liefergebiet ab.'
                  : 'Abholadresse folgt zum Shopstart.'}
              </p>
              <button
                className="button primary full-width"
                onClick={() => {
                  setCartOpen(false);
                  setInfo('Bestellvorschau');
                }}
              >
                Bestellvorschau ansehen <ArrowRight size={19} />
              </button>
              <small>Es wird keine Bestellung ausgelöst.</small>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <SheetContent className="shop-sheet">
          <SheetHeader>
            <SheetTitle>{detail?.name || 'Produktdetails'}</SheetTitle>
            <SheetDescription>Dein nächster Snack-Crush?</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="sheet-body">
              <ProductImage product={detail} className="detail-image" />
              <div className="detail-title">
                <h2>{detail.name}</h2>
                <strong>{money(detail.price)}</strong>
              </div>
              <p className="muted">
                {detail.category} · {detail.unit}
              </p>
              <p className="detail-description">{detail.description}</p>
              <button
                className="button primary full-width"
                onClick={() => add(detail)}
              >
                In den Warenkorb <Plus size={19} />
              </button>
              <div className="ingredients">
                <h3>Zutaten & Allergene</h3>
                <p>{detail.ingredients}</p>
              </div>
              <p className="demo-note">
                Sortimentsvorschau. Bild, Text, Menge und Preis dienen als
                Beispiel. Noch nicht bestellbar.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet
        open={!!info}
        onOpenChange={(open) => {
          if (!open) setInfo('');
        }}
      >
        <SheetContent className="shop-sheet">
          <SheetHeader>
            <SheetTitle>{info || 'Information'}</SheetTitle>
            <SheetDescription>Candy Corner · Essen</SheetDescription>
          </SheetHeader>
          <div className="sheet-body information">
            {info === 'Bestellvorschau' ? (
              <>
                <span className="eyebrow pink">DEIN SWEET MIX</span>
                <h2>So sieht dein Warenkorb aus.</h2>
                <p>
                  {count} Artikel ·{' '}
                  {mode === 'delivery'
                    ? `Lieferung${postcode ? ` an PLZ ${postcode}` : ''}`
                    : 'Abholung in Essen-Zentrum'}
                </p>
                <div className="review-items">
                  {cart.map((item) => (
                    <p key={item.id}>
                      {item.qty} ×{' '}
                      {products.find((p) => p.id === item.id)?.name}
                      <strong>
                        {money(
                          (products.find((p) => p.id === item.id)?.price || 0) *
                            item.qty,
                        )}
                      </strong>
                    </p>
                  ))}
                </div>
                <p>Lieferkosten: {money(shipping)}</p>
                <h3>Gesamt: {money(subtotal + shipping)}</h3>
                {remaining > 0 && (
                  <p className="pink">
                    Bis zum Mindestbestellwert fehlen {money(remaining)}.
                  </p>
                )}
                <div className="notice-box">
                  <h3>Fast bereit für echte Candy-Momente.</h3>
                  <p>
                    Der Shop ist noch eine Vorschau. Es werden keine
                    Bestellungen, Adressen oder Zahlungen übermittelt.
                    Liefergebiet, Abholadresse und echte Produkte werden zum
                    Start ergänzt.
                  </p>
                </div>
                <button
                  className="button primary full-width"
                  onClick={() => {
                    setInfo('');
                    setCartOpen(true);
                  }}
                >
                  Zurück zum Warenkorb
                </button>
              </>
            ) : info === 'Datenschutz' ? (
              <>
                <h2>Datenschutz in der Vorschau</h2>
                <p>
                  Der Warenkorb wird lokal in deinem Browser gespeichert. Diese
                  Vorschau übermittelt keine Bestellungen oder Zahlungsdaten.
                  Die Auslieferung der Website erfolgt über den Hostinganbieter.
                </p>
                <p>
                  Verbindliche Betreiber- und Datenschutzinformationen werden
                  vor dem Verkaufsstart ergänzt. Dies ist keine vollständige
                  Datenschutzerklärung.
                </p>
                <button
                  className="button light"
                  onClick={() => {
                    saveCart([]);
                    setFavorites([]);
                    setToast(
                      'Dein Warenkorb und deine Merkliste wurden geleert.',
                    );
                  }}
                >
                  Warenkorb & Merkliste leeren
                </button>
              </>
            ) : info === 'Kontakt' ? (
              <>
                <h2>Dein Candy-Spot in Essen.</h2>
                <p>Geplanter Abholort: Essen-Zentrum.</p>
                <p>
                  Die genaue Adresse, Öffnungszeiten und Kontaktmöglichkeiten
                  folgen zum Shopstart.
                </p>
              </>
            ) : (
              <>
                <h2>Candy Corner — Designvorschau</h2>
                <p>
                  Die verbindlichen Angaben zum Betreiber werden vor dem
                  Verkaufsstart ergänzt. Diese Vorschau nimmt keine Bestellungen
                  an.
                </p>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {toast && (
        <output className="toast">
          <Check size={18} />
          {toast}
          <button aria-label="Hinweis schließen" onClick={() => setToast('')}>
            <X size={15} />
          </button>
        </output>
      )}
    </>
  );
}
