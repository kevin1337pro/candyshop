'use client';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Heart,
  ShoppingBag,
  Menu,
  Plus,
  Minus,
  X,
  SlidersHorizontal,
  MoveUpRight,
  Check,
  Package,
  Ruler,
  Layers,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Product = {
  id: number;
  name: string;
  type: string;
  price: number;
  color: string;
  hex: string;
  tag: string;
  position: string;
  description: string;
  sizes: string[];
};
const products: Product[] = [
  {
    id: 1,
    name: 'The Heavy Tee',
    type: 'T-Shirts',
    price: 39.9,
    color: 'Off White',
    hex: '#e7e5dd',
    tag: 'ESSENTIAL',
    position: '0% 0%',
    description:
      'Ein klarer Schnitt, überschnittene Schultern und ein angenehm schwerer Griff. Das T-Shirt, auf dem dein Everyday-Look aufbaut.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 2,
    name: 'The Boxy Jacket',
    type: 'Jacken',
    price: 119.9,
    color: 'Black',
    hex: '#292a28',
    tag: 'NEU',
    position: '100% 0%',
    description:
      'Kurze, weite Silhouette mit durchgehendem Reißverschluss. Eine leichte Jacke für den Übergang und unkomplizierte Layering-Looks.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 3,
    name: 'The Straight Denim',
    type: 'Hosen',
    price: 79.9,
    color: 'Indigo',
    hex: '#354554',
    tag: '',
    position: '0% 100%',
    description:
      'Gerades Bein, entspannte Passform und ein dunkler Denim-Ton. Kombiniert sich genauso leicht mit deinem Lieblings-Tee wie mit einem Blazer.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 4,
    name: 'The Knit Crew',
    type: 'Strick',
    price: 69.9,
    color: 'Chocolate',
    hex: '#4b3429',
    tag: 'NEU',
    position: '100% 100%',
    description:
      'Markante Rippstruktur und ein entspannter Rundhalsausschnitt. Ein vielseitiger Begleiter für kühlere Tage.',
    sizes: ['XS', 'S', 'M', 'L'],
  },
];
const money = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
type BagItem = { id: number; size: string; qty: number };
type DeviceState = { bag: BagItem[]; favorites: number[] };
const emptyDeviceState: DeviceState = { bag: [], favorites: [] };
let deviceState = emptyDeviceState;
let deviceLoaded = false;
const deviceListeners = new Set<() => void>();
function getDeviceSnapshot(): DeviceState {
  if (!deviceLoaded && typeof window !== 'undefined') {
    deviceLoaded = true;
    try {
      const saved = JSON.parse(localStorage.getItem('forme-shop-v1') || '{}');
      deviceState = {
        bag: Array.isArray(saved.bag)
          ? saved.bag.filter(
              (x: BagItem) =>
                x &&
                products.some(
                  (p) => p.id === x.id && p.sizes.includes(x.size),
                ) &&
                Number.isInteger(x.qty) &&
                x.qty > 0 &&
                x.qty <= 20,
            )
          : [],
        favorites: Array.isArray(saved.favorites)
          ? saved.favorites.filter((id: number) =>
              products.some((p) => p.id === id),
            )
          : [],
      };
    } catch {
      deviceState = emptyDeviceState;
    }
  }
  return deviceState;
}
function serverDeviceSnapshot() {
  return emptyDeviceState;
}
function subscribeDevice(listener: () => void) {
  deviceListeners.add(listener);
  const changed = (event: StorageEvent) => {
    if (event.key === 'forme-shop-v1' || event.key === null) {
      deviceLoaded = false;
      listener();
    }
  };
  window.addEventListener('storage', changed);
  return () => {
    deviceListeners.delete(listener);
    window.removeEventListener('storage', changed);
  };
}
function updateDevice(next: DeviceState) {
  deviceState = next;
  try {
    localStorage.setItem('forme-shop-v1', JSON.stringify(next));
  } catch {
    /* Browser storage may be disabled. */
  }
  deviceListeners.forEach((listener) => listener());
}
function setBag(value: BagItem[] | ((previous: BagItem[]) => BagItem[])) {
  const current = getDeviceSnapshot();
  updateDevice({
    ...current,
    bag: typeof value === 'function' ? value(current.bag) : value,
  });
}
function setFavorites(value: number[] | ((previous: number[]) => number[])) {
  const current = getDeviceSnapshot();
  updateDevice({
    ...current,
    favorites: typeof value === 'function' ? value(current.favorites) : value,
  });
}
function ProductImage({
  p,
  className = '',
}: {
  p: Product;
  className?: string;
}) {
  const [x, y] = p.position.split(' ');
  return (
    <div className={`product-image ${className}`}>
      <Image
        src="/images/products.png"
        alt={`${p.name} in ${p.color}`}
        width={1254}
        height={1254}
        unoptimized
        style={{
          left: x === '100%' ? '-100%' : 0,
          top: y === '100%' ? '-100%' : 0,
        }}
      />
    </div>
  );
}
export default function Home() {
  const [category, setCategory] = useState('Alle');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const { bag, favorites } = useSyncExternalStore(
    subscribeDevice,
    getDeviceSnapshot,
    serverDeviceSnapshot,
  );
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sizeFilter, setSizeFilter] = useState('Alle');
  const [info, setInfo] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (category === 'Alle' ||
              (category === 'Neu' ? p.tag === 'NEU' : p.type === category)) &&
            (!favoriteOnly || favorites.includes(p.id)) &&
            (sizeFilter === 'Alle' || p.sizes.includes(sizeFilter)) &&
            `${p.name} ${p.type} ${p.color}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'asc'
            ? a.price - b.price
            : sort === 'desc'
              ? b.price - a.price
              : 0,
        ),
    [category, query, sort, favoriteOnly, favorites, sizeFilter],
  );
  const total = bag.reduce(
    (s, i) => s + products.find((p) => p.id === i.id)!.price * i.qty,
    0,
  );
  const count = bag.reduce((s, i) => s + i.qty, 0);
  function shop(cat = 'Alle') {
    setCategory(cat);
    setFavoriteOnly(false);
    setQuery('');
    setMenuOpen(false);
    document
      .getElementById('kollektion')
      ?.scrollIntoView({ behavior: 'smooth' });
  }
  function openProduct(p: Product) {
    setSelected(p);
    setSize('');
    setSizeError(false);
  }
  function toggleFavorite(id: number) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function add() {
    if (!selected) return;
    if (!size) {
      setSizeError(true);
      return;
    }
    setBag((prev) => {
      const match = prev.find((x) => x.id === selected.id && x.size === size);
      return match
        ? prev.map((x) =>
            x === match ? { ...x, qty: Math.min(20, x.qty + 1) } : x,
          )
        : [...prev, { id: selected.id, size, qty: 1 }];
    });
    setSelected(null);
    setCartOpen(true);
  }
  function changeQty(id: number, size: string, delta: number) {
    setBag((prev) =>
      prev
        .map((x) =>
          x.id === id && x.size === size
            ? { ...x, qty: Math.min(20, x.qty + delta) }
            : x,
        )
        .filter((x) => x.qty > 0),
    );
  }
  return (
    <>
      <a className="skip-link" href="#kollektion">
        Zur Kollektion springen
      </a>
      <div className="announcement">
        <span>EVERYDAY WEAR. ANYWHERE.</span>
        <span>
          THE AUTUMN EDIT — 2026 <ArrowUpRight size={13} />
        </span>
        <span className="demo-label">SHOP-VORSCHAU</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button mobile-menu"
            aria-label="Menü öffnen"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>
          <a href="#top" className="wordmark" aria-label="FORME Startseite">
            FORME<span>ST.</span>
          </a>
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              document
                .getElementById('kollektion')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Search size={18} />
            <input
              aria-label="Kollektion durchsuchen"
              placeholder="Finde deinen nächsten Lieblingslook"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCategory('Alle');
                setFavoriteOnly(false);
              }}
            />
            {query && (
              <button
                type="button"
                aria-label="Suche löschen"
                onClick={() => setQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </form>
          <div className="header-actions">
            <button
              className={`icon-button ${favoriteOnly ? 'is-active' : ''}`}
              aria-label="Merkliste anzeigen"
              onClick={() => {
                setFavoriteOnly(!favoriteOnly);
                setCategory('Alle');
                setQuery('');
                document
                  .getElementById('kollektion')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Heart />
              <span className="desktop-label">Merkliste</span>
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </button>
            <button
              className="icon-button bag-button"
              onClick={() => setCartOpen(true)}
              aria-label={`Warenkorb mit ${count} Artikeln`}
            >
              <ShoppingBag />
              <span className="desktop-label">Warenkorb</span>
              <b>{count}</b>
            </button>
          </div>
        </div>
        <nav className="main-nav" aria-label="Hauptnavigation">
          <div className="nav-links">
            <button onClick={() => shop('Neu')}>
              Neu eingetroffen <span className="tiny-dot" />
            </button>
            <button onClick={() => shop()}>Alle Styles</button>
            <button onClick={() => shop('T-Shirts')}>T-Shirts</button>
            <button onClick={() => shop('Jacken')}>Jacken</button>
            <button onClick={() => shop('Hosen')}>Hosen</button>
            <button onClick={() => shop('Strick')}>Strick</button>
          </div>
          <button
            className="nav-editorial"
            onClick={() =>
              document
                .getElementById('everyday')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            The Everyday Edit <ArrowUpRight size={16} />
          </button>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="white-dot" /> NEW SEASON / VOL. 01
            </div>
            <h1>
              DEIN STIL.
              <br />
              DEIN ALLTAG.
              <br />
              <span>DEINE FORM.</span>
            </h1>
            <p>
              Klare Schnitte. Neue Perspektiven.
              <br />
              Entdecke Essentials, die zu dir passen.
            </p>
            <button className="button button-white" onClick={() => shop()}>
              Kollektion entdecken <ArrowUpRight size={21} />
            </button>
            <div className="hero-bottom">
              <span>WENIGER, ABER BESSER.</span>
              <span>01 — 04</span>
            </div>
          </div>
          <div className="hero-photo">
            <Image
              unoptimized
              fill
              src="/images/hero.png"
              alt="Zwei erwachsene Models in urbanen FORME Outfits vor einer Betonarchitektur"
              fetchPriority="high"
            />
            <span className="hero-photo-label">THE EVERYDAY EDIT</span>
            <button
              className="photo-link"
              aria-label="Neue Kollektion entdecken"
              onClick={() => shop('Neu')}
            >
              <ArrowUpRight size={25} />
            </button>
          </div>
        </section>
        <div className="values-strip">
          <span>
            <Layers size={19} /> Essentials zum Kombinieren
          </span>
          <span>
            <Ruler size={19} /> Entspannte Silhouetten
          </span>
          <span>
            <Package size={19} /> Deine Auswahl. Dein Look.
          </span>
        </div>
        <section className="collection section-wrap" id="kollektion">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark-eyebrow">THE GOOD EVERYDAY</p>
              <h2>
                {favoriteOnly
                  ? 'Deine Merkliste.'
                  : query
                    ? 'Deine Suchergebnisse.'
                    : 'Neue Lieblingsteile.'}
              </h2>
            </div>
            <span className="result-count">
              {filtered.length} Styles entdecken <ArrowDownMark />
            </span>
          </div>
          <div className="catalog-tools">
            <div className="category-tabs" aria-label="Produktkategorien">
              {['Alle', 'Neu', 'T-Shirts', 'Jacken', 'Hosen', 'Strick'].map(
                (cat) => (
                  <button
                    key={cat}
                    className={category === cat ? 'active' : ''}
                    onClick={() => {
                      setCategory(cat);
                      setFavoriteOnly(false);
                    }}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
            <div className="filter-tools">
              <button
                className="filter-button"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={17} /> Filter
                {sizeFilter !== 'Alle' ? ' (1)' : ''}
              </button>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v || 'featured')}
              >
                <SelectTrigger
                  className="sort-select"
                  aria-label="Produkte sortieren"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Empfohlen</SelectItem>
                  <SelectItem value="asc">Preis aufsteigend</SelectItem>
                  <SelectItem value="desc">Preis absteigend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="product-visual">
                    <button
                      className="product-open"
                      aria-label={`${p.name} ansehen`}
                      onClick={() => openProduct(p)}
                    >
                      <ProductImage p={p} />
                    </button>
                    {p.tag && (
                      <span
                        className={`product-tag ${p.tag === 'NEU' ? 'tag-blue' : ''}`}
                      >
                        {p.tag}
                      </span>
                    )}
                    <button
                      className={`favorite-button ${favorites.includes(p.id) ? 'saved' : ''}`}
                      aria-label={`${p.name} ${favorites.includes(p.id) ? 'von Merkliste entfernen' : 'merken'}`}
                      aria-pressed={favorites.includes(p.id)}
                      onClick={() => toggleFavorite(p.id)}
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(p.id) ? 'currentColor' : 'none'
                        }
                      />
                    </button>
                    <button
                      className="quick-add"
                      aria-label={`${p.name} Größe auswählen`}
                      onClick={() => openProduct(p)}
                    >
                      <Plus size={19} />
                    </button>
                  </div>
                  <div className="product-meta">
                    <div>
                      <button
                        className="product-name"
                        onClick={() => openProduct(p)}
                      >
                        {p.name}
                      </button>
                      <p>{p.color} / Relaxed Fit</p>
                    </div>
                    <strong>{money(p.price)}</strong>
                  </div>
                  <div className="swatch-line">
                    <span style={{ background: p.hex }} />
                    <span className="product-category">{p.type}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>
                {favoriteOnly
                  ? 'Noch keine Lieblingsteile gespeichert.'
                  : 'Keine passenden Styles gefunden.'}
              </h3>
              <p>
                {favoriteOnly
                  ? 'Tippe auf das Herz an einem Produkt, um es hier wiederzufinden.'
                  : 'Probiere einen anderen Suchbegriff oder setze die Filter zurück.'}
              </p>
              <button
                className="button button-dark"
                onClick={() => {
                  setSizeFilter('Alle');
                  shop();
                }}
              >
                Alle Styles ansehen <ArrowRight size={18} />
              </button>
            </div>
          )}
          <div className="collection-note">
            <span>Eine Kollektion. Viele Möglichkeiten.</span>
            <span>
              Beispielprodukte & Preise · Keine Bestellungen in der Vorschau
            </span>
          </div>
        </section>
        <section className="editorial section-wrap" id="everyday">
          <div className="editorial-image">
            <Image
              unoptimized
              fill
              src="/images/editorial.png"
              alt="Model in einem lockeren dunklen Blazer mit weißem T-Shirt"
              loading="lazy"
            />
            <span>FORME / EVERYDAY STORIES</span>
          </div>
          <div className="editorial-copy">
            <p className="eyebrow">WENIGER TEILE. MEHR DU.</p>
            <h2>
              Passt nicht nur.
              <br />
              Passt zu dir.
            </h2>
            <p>
              Für Tage ohne Dresscode. Für Pläne, die sich ändern. Für deinen
              ganz eigenen Rhythmus.
            </p>
            <p>
              Unsere Everyday Essentials machen es dir leicht, deinen Look immer
              wieder neu zu kombinieren.
            </p>
            <button className="text-link" onClick={() => shop()}>
              Finde deine Essentials <ArrowUpRight size={23} />
            </button>
            <span className="editorial-index">
              [ F. 01 / EVERYDAY ESSENTIALS ]
            </span>
          </div>
        </section>
        <section className="brand-statement section-wrap">
          <span>MADE FOR YOUR EVERYDAY.</span>
          <h2>
            Guter Stil beginnt
            <br />
            mit deinem Gefühl.
          </h2>
          <ArrowUpRight size={60} />
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <a href="#top" className="wordmark footer-logo">
              FORME<span>ST.</span>
            </a>
            <p>Essentials für deinen eigenen Weg.</p>
          </div>
          <div className="footer-links">
            <div>
              <h3>Entdecken</h3>
              <button onClick={() => shop('Neu')}>Neue Styles</button>
              <button onClick={() => shop()}>Die Kollektion</button>
              <button
                onClick={() => {
                  setFavoriteOnly(true);
                  document
                    .getElementById('kollektion')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Deine Merkliste
              </button>
            </div>
            <div>
              <h3>Gut zu wissen</h3>
              <button onClick={() => setInfo('Größenberatung')}>
                Größenberatung
              </button>
              <button onClick={() => setInfo('Versand & Rückgabe')}>
                Versand & Rückgabe
              </button>
              <button onClick={() => setInfo('Über diese Vorschau')}>
                Über den Shop
              </button>
            </div>
            <div>
              <h3>WordPress</h3>
              <a href="/downloads/forme-woocommerce-theme.zip" download>
                Theme herunterladen <ArrowUpRight size={14} />
              </a>
              <Link href="/downloads/forme-einrichtung.html">
                Einrichtung & nächste Schritte
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FORME Studio</span>
          <span>DE / EUR</span>
          <div>
            <button onClick={() => setInfo('Impressum')}>Impressum</button>
            <button onClick={() => setInfo('Datenschutz')}>Datenschutz</button>
          </div>
        </div>
      </footer>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="shop-sheet product-sheet">
          <SheetHeader>
            <SheetTitle>Dein nächstes Essential</SheetTitle>
            <SheetDescription>Details & Größenauswahl</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="sheet-body">
              <ProductImage p={selected} className="detail-image" />
              <div className="detail-title">
                <h2>{selected.name}</h2>
                <strong>{money(selected.price)}</strong>
              </div>
              <p className="muted">{selected.color} / Relaxed Fit</p>
              <p className="detail-description">{selected.description}</p>
              <div className="size-heading">
                <strong>Größe auswählen</strong>
                <button onClick={() => setInfo('Größenberatung')}>
                  Größenberatung <Ruler size={16} />
                </button>
              </div>
              <RadioGroup
                value={size}
                onValueChange={(v) => {
                  setSize(v);
                  setSizeError(false);
                }}
                className="size-options"
                aria-label="Kleidergröße"
              >
                {selected.sizes.map((s) => (
                  <label
                    key={s}
                    className={`size-option ${size === s ? 'chosen' : ''}`}
                  >
                    <RadioGroupItem value={s} className="sr-only" />
                    {s}
                  </label>
                ))}
              </RadioGroup>
              {sizeError && (
                <p className="form-error" role="alert">
                  Bitte wähle zuerst deine Größe.
                </p>
              )}
              <button className="button button-blue full-width" onClick={add}>
                In den Warenkorb <ShoppingBag size={19} />
              </button>
              <p className="demo-note">
                Beispielprodukt mit KI-generiertem Bild. Diese Vorschau löst
                keine Bestellung aus.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="shop-sheet">
          <SheetHeader>
            <SheetTitle>Dein Warenkorb ({count})</SheetTitle>
            <SheetDescription>Deine Auswahl für den Alltag.</SheetDescription>
          </SheetHeader>
          <div className="sheet-body cart-body">
            {bag.length ? (
              bag.map((item) => {
                const p = products.find((x) => x.id === item.id)!;
                return (
                  <div className="cart-item" key={`${item.id}-${item.size}`}>
                    <ProductImage p={p} />
                    <div>
                      <h3>{p.name}</h3>
                      <p>
                        {p.color} · Größe {item.size}
                      </p>
                      <strong>{money(p.price * item.qty)}</strong>
                      <div className="quantity">
                        <button
                          aria-label={`${p.name} Anzahl verringern`}
                          onClick={() => changeQty(p.id, item.size, -1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          aria-label={`${p.name} Anzahl erhöhen`}
                          disabled={item.qty >= 20}
                          onClick={() => changeQty(p.id, item.size, 1)}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          className="remove-item"
                          onClick={() => setBag(bag.filter((x) => x !== item))}
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <ShoppingBag size={40} />
                <h3>Platz für neue Lieblingsteile.</h3>
                <p>Dein Warenkorb ist noch leer.</p>
                <button
                  className="button button-dark"
                  onClick={() => {
                    setCartOpen(false);
                    shop();
                  }}
                >
                  Kollektion entdecken
                </button>
              </div>
            )}
          </div>
          {bag.length > 0 && (
            <div className="cart-summary">
              <div>
                <span>Zwischensumme</span>
                <strong>{money(total)}</strong>
              </div>
              <p>
                Beispielpreise. Versand & Steuern werden im späteren
                WooCommerce-Shop konfiguriert.
              </p>
              <button
                className="button button-blue full-width"
                onClick={() => setInfo('Kasse in der Vorschau')}
              >
                Zur Kasse <ArrowRight size={19} />
              </button>
              <small>Vorschau · Noch kein Kauf möglich</small>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent className="shop-sheet">
          <SheetHeader>
            <SheetTitle>Finde deinen Fit</SheetTitle>
            <SheetDescription>
              Filtere die Kollektion nach deiner Größe.
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-body">
            <h3 className="filter-heading">Größe</h3>
            <RadioGroup
              value={sizeFilter}
              onValueChange={setSizeFilter}
              className="size-options"
            >
              {['Alle', 'XS', 'S', 'M', 'L', 'XL'].map((s) => (
                <label
                  className={`size-option ${sizeFilter === s ? 'chosen' : ''}`}
                  key={s}
                >
                  <RadioGroupItem value={s} className="sr-only" />
                  {s}
                </label>
              ))}
            </RadioGroup>
            <button
              className="button button-blue full-width"
              onClick={() => setFilterOpen(false)}
            >
              {filtered.length} Styles anzeigen <ArrowRight size={18} />
            </button>
            <button
              className="reset-filters"
              onClick={() => {
                setSizeFilter('Alle');
                setCategory('Alle');
                setQuery('');
              }}
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="shop-sheet">
          <SheetHeader>
            <SheetTitle>FORME / Entdecken</SheetTitle>
            <SheetDescription>Deine Everyday-Kollektion</SheetDescription>
          </SheetHeader>
          <nav className="mobile-links">
            {['Alle', 'Neu', 'T-Shirts', 'Jacken', 'Hosen', 'Strick'].map(
              (x) => (
                <button key={x} onClick={() => shop(x)}>
                  {x === 'Alle' ? 'Alle Styles' : x}
                  <ArrowUpRight />
                </button>
              ),
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <Sheet
        open={!!info}
        onOpenChange={(open) => {
          if (!open) setInfo(null);
        }}
      >
        <SheetContent className="shop-sheet">
          <SheetHeader>
            <SheetTitle>{info}</SheetTitle>
            <SheetDescription>FORME Studio</SheetDescription>
          </SheetHeader>
          <div className="sheet-body information">
            {info === 'Größenberatung' ? (
              <>
                <h3>Entspannt geschnitten.</h3>
                <p>
                  Die gezeigte Kollektion ist ein Designbeispiel. Verbindliche
                  Maße und Materialangaben werden mit den echten Produkten
                  hinterlegt.
                </p>
                <p>
                  Für deinen späteren Shop lassen sich Größen wie XS bis XL als
                  WooCommerce-Varianten mit eigenen Beständen pflegen.
                </p>
              </>
            ) : info === 'Kasse in der Vorschau' ? (
              <>
                <ShoppingBag size={36} />
                <h3>Dein Look ist zusammengestellt.</h3>
                <p>
                  Diese Vorschau nimmt keine Bestellungen oder Zahlungen
                  entgegen. Der installierbare WordPress-Shop nutzt den echten
                  WooCommerce-Warenkorb und Checkout.
                </p>
                <a
                  className="button button-blue"
                  href="/downloads/forme-woocommerce-theme.zip"
                  download
                >
                  WooCommerce-Theme herunterladen <ArrowUpRight size={18} />
                </a>
              </>
            ) : info === 'Versand & Rückgabe' ? (
              <>
                <h3>Alle Details vor deinem Kauf.</h3>
                <p>
                  Versandkosten, Liefergebiete und Rückgabebedingungen werden
                  vor dem Shopstart vom Betreiber ergänzt. Aktuell sind keine
                  Bestellungen möglich.
                </p>
              </>
            ) : info === 'Impressum' ? (
              <>
                <h3>Unveröffentlichte Shop-Vorschau</h3>
                <p>
                  Betreiberangaben wurden noch nicht bereitgestellt. Vor dem
                  öffentlichen Shopstart muss hier das vollständige Impressum
                  des tatsächlichen Betreibers stehen.
                </p>
              </>
            ) : info === 'Datenschutz' ? (
              <>
                <p>
                  Diese Vorschau speichert Warenkorb und Merkliste lokal in
                  deinem Browser. Es werden keine Zahlungs- oder Bestelldaten
                  abgefragt. Es sind keine Marketing-Tracker eingebunden.
                </p>
                <button
                  className="button button-dark"
                  onClick={() => {
                    setBag([]);
                    setFavorites([]);
                    setNotice('Warenkorb und Merkliste wurden gelöscht.');
                  }}
                >
                  Lokale Shopdaten löschen
                </button>
                <p>
                  Die vollständigen Datenschutzhinweise des späteren Shops
                  müssen dessen Hosting, Zahlungsanbieter und weitere Dienste
                  berücksichtigen.
                </p>
              </>
            ) : (
              <>
                <h3>FORME — Everyday Wear.</h3>
                <p>
                  Ein eigenständiger Kleidungsshop mit klaren Formen und einer
                  vielseitigen Beispielkollektion. Alle Modebilder wurden mit KI
                  für dieses Design erstellt.
                </p>
                <p>
                  Die Vorschau zeigt Suche, Filter, Produktdetails, Merkliste
                  und Warenkorb. Die Verwaltung und der echte Verkauf laufen
                  nach der Installation über WordPress und WooCommerce.
                </p>
                <Link
                  href="/downloads/forme-einrichtung.html"
                  className="text-link"
                >
                  Zur Einrichtung <ArrowUpRight size={18} />
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {notice && (
        <output className="toast" aria-live="polite">
          <Check size={18} />
          {notice}
        </output>
      )}
    </>
  );
}
function ArrowDownMark() {
  return <MoveUpRight size={20} style={{ transform: 'rotate(90deg)' }} />;
}
