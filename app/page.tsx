'use client';
/* oxlint-disable next/no-img-element -- Responsive WebP files are pre-optimized at build time; no runtime image proxy is needed. */
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
  Menu,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
      <img
        src={`/images/${product.image}.webp`}
        srcSet={`/images/${product.image}-240.webp 240w, /images/${product.image}-480.webp 480w, /images/${product.image}.webp 627w`}
        sizes={
          className.includes('detail')
            ? '(min-width: 768px) 440px, calc(100vw - 48px)'
            : '(min-width: 1024px) 300px, (min-width: 768px) 30vw, 46vw'
        }
        alt={`${product.name} – KI-Beispielbild`}
        width={627}
        height={627}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useSyncExternalStore(subscribe, getCart, () => emptyCart);
  const [mode, setMode] = useState('delivery');
  const [postcode, setPostcode] = useState('');
  const [message, setMessage] = useState('');
  const [checkedPostcode, setCheckedPostcode] = useState('');
  const deliveryAllowed =
    checkedPostcode === postcode && checkPostcode(postcode).available;
  const [category, setCategory] = useState('Alle');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [cartOpen, setCartOpen] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageAction, setAgeAction] = useState<{
    product: Product;
    action: 'detail' | 'add';
  } | null>(null);
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
  const openProduct = (p: Product) => {
    if (p.ageNotice && !ageConfirmed) {
      setAgeAction({ product: p, action: 'detail' });
      return;
    }
    setDetail(p);
  };
  const add = (p: Product, confirmed = ageConfirmed) => {
    if (p.ageNotice && !confirmed) {
      setAgeAction({ product: p, action: 'add' });
      return;
    }
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
          <Truck size={14} /> Lieferservice in Essen{' '}
          <span className="announcement-dot">✦</span> Ab{' '}
          {money(shopConfig.minimum)} Bestellwert
        </span>
      </div>
      <header className="site-header wrap">
        <a href="#top" className="brand" aria-label="Candy Corner – Startseite">
          <img
            src="/images/candy-corner-logo.webp"
            srcSet="/images/candy-corner-logo-192.webp 192w, /images/candy-corner-logo-384.webp 384w, /images/candy-corner-logo.webp 768w"
            sizes="(min-width: 768px) 126px, 96px"
            decoding="async"
            alt="Candy Corner"
            width="768"
            height="512"
          />
        </a>
        <nav
          id="primary-nav"
          className={menuOpen ? 'menu-is-open' : ''}
          aria-label="Hauptnavigation"
        >
          <a href="#sortiment" onClick={() => setMenuOpen(false)}>
            Unser Sortiment
          </a>
          <a href="#so-gehts" onClick={() => setMenuOpen(false)}>
            So funktioniert’s
          </a>
          <a href="#fragen" onClick={() => setMenuOpen(false)}>
            Gut zu wissen
          </a>
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
          <button
            className="bag-button"
            aria-label={`Warenkorb: ${count} Artikel`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={19} />
            <span className="bag-label desktop-label">Warenkorb</span>
            <b className="bag-count">{count}</b>
          </button>
          <button
            className="mobile-menu"
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-controls="primary-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
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
              Wie kommt dein <br />
              Glück zu dir?
            </h2>
            <p>Persönlich geliefert. Einfach bezahlt.</p>
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
                    setCheckedPostcode(postcode);
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
                        setCheckedPostcode('');
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
              <span className="cyan-dot" /> DEIN LOKALER CANDY-LIEFERSERVICE
            </span>
            <h1>
              Dein Leben.
              <br />
              Ein bisschen <em>süßer.</em>
            </h1>
            <p>
              Süß, sauer, crunchy. Entdecke deinen nächsten Lieblingssnack – für
              die Couch, die Crew und einfach so. Süßigkeiten, Snacks und Drinks
              persönlich geliefert in Essen oder zur Abholung.
            </p>
            <a className="button primary hero-cta" href="#sortiment">
              Entdecke deine Lieblinge <ArrowUpRight size={21} />
            </a>
            <div className="hero-caption">
              <MapPin size={15} />
              <span>Aus unserem Laden. Direkt zu deiner Tür.</span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/images/candy-hero.webp"
              srcSet="/images/candy-hero-480.webp 480w, /images/candy-hero-768.webp 768w, /images/candy-hero-1152.webp 1152w, /images/candy-hero.webp 1536w"
              sizes="(min-width: 1024px) 700px, (min-width: 768px) 55vw, calc(100vw - 32px)"
              loading="eager"
              decoding="async"
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
            <Candy size={21} /> Persönlich mit dem Auto geliefert
          </span>
          <span>
            <Store size={21} /> Dein Candy-Spot in Essen
          </span>
          <span>
            <Package size={21} /> Dein Candy-Spot in Essen
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
                      onClick={() => openProduct(p)}
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
                      onClick={() => openProduct(p)}
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
            <img
              src="/images/candy-corner-logo.webp"
              srcSet="/images/candy-corner-logo-192.webp 192w, /images/candy-corner-logo-384.webp 384w, /images/candy-corner-logo.webp 768w"
              sizes="(min-width: 768px) 420px, 260px"
              decoding="async"
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
        <section
          className="local-info wrap"
          id="candy-in-essen"
          aria-labelledby="local-heading"
        >
          <span className="eyebrow cyan">DEIN CANDY-SPOT VOR ORT</span>
          <h2 id="local-heading">Süßigkeiten liefern lassen in Essen.</h2>
          <dl>
            <div>
              <dt>Persönliche Lieferung</dt>
              <dd>
                Wir bringen Süßigkeiten, Snacks und Drinks mit dem Auto zu dir
                in Essen. Kein Paketversand. Prüfe vor deiner Bestellung{' '}
                <a href="#bestellen">deine Postleitzahl</a>.
              </dd>
            </div>
            <div>
              <dt>Bestellwert & Lieferkosten</dt>
              <dd>
                Ab {money(shopConfig.minimum)} Warenwert. Lieferung:{' '}
                {money(shopConfig.deliveryFee)}. Abholung ohne Lieferkosten.
              </dd>
            </div>
            <div>
              <dt>Abholen bei Candy Corner</dt>
              <dd>
                Essen-Zentrum – die genaue Abholadresse folgt zum Shopstart.
              </dd>
            </div>
          </dl>
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
                Wir liefern persönlich mit dem Auto innerhalb von Essen. Gib
                oben deine PLZ ein. Außerhalb unserer Essener Liefer-PLZ ist
                eine Lieferbestellung nicht möglich.
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
              <summary>Wie bezahle ich?</summary>
              <p>
                Im Shop ist Barzahlung bei Übergabe vorgesehen. PayPal kommt
                nach der Kontofreischaltung hinzu. Diese Designvorschau nimmt
                keine Zahlungen entgegen. Es gibt keinen Paketversand.
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
              <img
                src="/images/candy-corner-logo.webp"
                srcSet="/images/candy-corner-logo-192.webp 192w, /images/candy-corner-logo-384.webp 384w, /images/candy-corner-logo.webp 768w"
                sizes="(min-width: 768px) 126px, 96px"
                decoding="async"
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
              <a href="#bestellen">Lieferservice in Essen</a>
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
                  ? 'Persönlicher Lieferservice innerhalb von Essen.'
                  : 'Abholadresse folgt zum Shopstart.'}
              </p>
              <p className="payment-hint">{shopConfig.paymentLabel}</p>
              {mode === 'delivery' && !deliveryAllowed && (
                <div className="delivery-block">
                  <MapPin size={18} />
                  <p>
                    {postcode && checkedPostcode
                      ? checkPostcode(postcode).message
                      : 'Bitte zuerst deine Essener Liefer-PLZ prüfen.'}
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      document
                        .getElementById('bestellen')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    PLZ prüfen <ArrowRight size={16} />
                  </button>
                </div>
              )}
              <button
                className="button primary full-width"
                disabled={
                  remaining > 0 || (mode === 'delivery' && !deliveryAllowed)
                }
                onClick={() => {
                  if (
                    remaining > 0 ||
                    (mode === 'delivery' && !deliveryAllowed)
                  )
                    return;
                  setCartOpen(false);
                  setInfo('Bestellvorschau');
                }}
              >
                Bestellvorschau ansehen <ArrowRight size={19} />
              </button>
              <small>Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</small>
              <small>Es wird keine Bestellung ausgelöst.</small>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!ageAction}
        onOpenChange={(open) => {
          if (!open) setAgeAction(null);
        }}
      >
        <DialogContent className="age-dialog" showCloseButton={false}>
          <DialogHeader>
            <span className="age-badge">18+</span>
            <DialogTitle>Bist du mindestens 18?</DialogTitle>
            <DialogDescription>
              Für diesen Artikel bitten wir dich um eine kurze
              Altersbestätigung.
            </DialogDescription>
          </DialogHeader>
          <button
            className="button primary full-width"
            onClick={() => {
              if (!ageAction) return;
              setAgeConfirmed(true);
              if (ageAction.action === 'add') add(ageAction.product, true);
              else setDetail(ageAction.product);
              setAgeAction(null);
            }}
          >
            Ja, ich bin mindestens 18
          </button>
          <button
            className="button full-width"
            onClick={() => setAgeAction(null)}
          >
            Nein, zurück
          </button>
        </DialogContent>
      </Dialog>
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
                    Abholadresse und echte Produkte werden zum Start ergänzt.
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
