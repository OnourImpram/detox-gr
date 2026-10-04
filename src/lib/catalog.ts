// Vitrin JSON: catalog-normalized.json'dan scripts/katalog-incelt.py ile üretilir (yalnız kullanılan alanlar; istemci paketi küçük kalsın)
import raw from "@/data/catalog-vitrin.json";
import infoRaw from "@/data/urun-bilgi.json";

export type CategoryId =
  | "lokum"
  | "soap"
  | "care"
  | "cream"
  | "essential"
  | "honey"
  | "pantry"
  | "nuts"
  | "dates"
  | "salt"
  | "flour"
  | "form"
  | "spice"
  | "oil";

export type ShipKind = "dry" | "glass" | "liquid";
export type ProductClass = "food" | "cosmetic" | "other";

/** Taha'nın doğruladığı ürün bilgisi (src/data/urun-bilgi.json); her alan isteğe bağlı, olmayan gösterilmez. */
export type ProductInfo = {
  grams?: number;
  unit?: string;
  ingredients?: string;
  allergens?: string;
  origin?: string;
  producer?: string;
  bestBefore?: string;
  inci?: string;
  responsiblePerson?: string;
  stock?: number;
  vatIncluded?: boolean;
  image?: string;
  images?: string[];
  nameTr?: string;
  nameEn?: string;
  note?: string;
};
const INFO = infoRaw as Record<string, ProductInfo | string>;
export function productInfo(sourceId: string): ProductInfo | undefined {
  const v = INFO[sourceId];
  return v && typeof v === "object" ? v : undefined;
}

export type Product = {
  slug: string;
  sourceId: string;
  name: string;
  category: CategoryId;
  priceEur: number | null;
  unit: string;
  grams: number | null;
  /** Görünen net miktar (kaynak listeden ya da Taha formundan); ml/l için grams ≈ hacim (kargo tahmini) */
  net: { value: number; unit: "g" | "ml" } | null;
  kind: ShipKind;
  klass: ProductClass;
  image: string;
  blurb: string;
  publish: boolean;
  houseNamed: boolean;
  storyTitle?: string;
  storyBody?: string;
  reviewFlags: string[];
  info?: ProductInfo;
};

export const CATEGORIES: { id: CategoryId; title: string; blurb: string }[] = [
  { id: "lokum", title: "Lokum", blurb: "İkram tabağı." },
  { id: "soap", title: "Sabun", blurb: "Kabak lifli ve yüz sabunları." },
  { id: "care", title: "Kişisel bakım", blurb: "Gül suyu ve bakım." },
  { id: "cream", title: "Kremler", blurb: "Cilt kremleri." },
  { id: "essential", title: "Uçucu yağlar", blurb: "Cam şişede aromatik yağlar." },
  { id: "honey", title: "Bal", blurb: "Çam, kestane, akçaağaç." },
  { id: "pantry", title: "Pekmez ve mutfak", blurb: "Pekmez, tahin, sirke, tarhana." },
  { id: "nuts", title: "Kuruyemiş", blurb: "Kurutulmuş meyve ve çerez." },
  { id: "dates", title: "Hurma", blurb: "Acve, Safavi, Sugay." },
  { id: "salt", title: "Tuz", blurb: "Kaya, deniz ve kaynak tuzu." },
  { id: "flour", title: "Un", blurb: "Mısır ve buğday unu." },
  { id: "form", title: "Form ürünleri", blurb: "Kahve ve toz karışımlar." },
  { id: "spice", title: "Baharat ve bitki", blurb: "Aktar rafı." },
  { id: "oil", title: "Yağlar", blurb: "Çörekotu, susam, keten." },
];

const CAT_MAP: Record<string, CategoryId> = {
  Lokumlar: "lokum",
  Sabunlar: "soap",
  "Kişisel bakım ürünleri": "care",
  "Doğal kremler": "cream",
  "Esansiyel yağlar": "essential",
  Bal: "honey",
  Pekmez: "pantry",
  Kuruyemişler: "nuts",
  Hurma: "dates",
  Tuz: "salt",
  Un: "flour",
  "Zayıflama ve Form ürünleri": "form",
  "Baharatlar - Bitkiler": "spice",
  Yağlar: "oil",
};

const CAT_OVERRIDE: Record<string, CategoryId> = {
  DT157: "pantry",
  DT158: "pantry",
};

const NAME_OVERRIDE: Record<string, string> = {
  DT054: "Kuyruk yağı kremi",
};

const SHELF: Record<CategoryId, string> = {
  lokum: "Kahvenin yanında, sohbetin ortasında.",
  soap: "Gündelik bakımın küçük bir ayrıntısı.",
  care: "Taha’nın bakım rafından, her güne.",
  cream: "Cilt bakımında günlük bir dokunuş.",
  essential: "Cam şişede, aktarın aromatik rafı.",
  honey: "Kavanozda bir manzara.",
  pantry: "Kilerin kalbi — sirke, pekmez, tarhana.",
  nuts: "Sofranın kenarına, çayın yanına.",
  dates: "Hurma seçkisi. Tatlı bir ikram.",
  salt: "Mutfağın sessiz temeli.",
  flour: "Hamurun başladığı yer.",
  form: "Fincanın yanına küçük bir keşif.",
  spice: "Aktar rafının kokusu.",
  oil: "Mutfak ve bakım için Taha’nın yağ rafı.",
};

type SourceRecord = {
  source_record_id: string;
  source_name: string;
  source_category: string;
  source_price: string | null;
  source_price_basis: string | null;
  source_quantity: string | number | null;
  source_unit: string | null;
  editorial_title_candidate: string | null;
  editorial_story_candidate: string | null;
  editorial_hook_candidate: string | null;
  review_flags: string[];
  editorial_status: string;
  publish: boolean;
};

const TR: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .split("")
    .map((ch) => TR[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function parsePrice(value: string | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function klassFor(category: CategoryId): ProductClass {
  if (category === "soap" || category === "care" || category === "cream" || category === "essential") return "cosmetic";
  if (category === "form") return "other";
  return "food";
}

function kindFor(category: CategoryId): ShipKind {
  if (category === "oil" || category === "essential" || category === "honey" || category === "pantry") return "glass";
  return "dry";
}

function text(...vals: Array<string | null | undefined>) {
  for (const v of vals) {
    const s = (v ?? "").trim();
    if (s) return s;
  }
  return "";
}

function titleStart(name: string) {
  const s = name.trim();
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

// Marka soneki addan çıkar: "Elma sirkesi DETOKS AKTAR" → "Elma sirkesi"; iki-raf bilgisi `houseNamed` rozetiyle verilir
// (red team RT-C kendi işine saldırı #3/#4: sonek EN/EL'ye çevrilemeden sızıyordu, rozetle çift damga oluyordu).
function stripHouseSuffix(name: string) {
  return name
    .replace(/\(\s*DETOKS AKTAR(?:\s+özel yapım)?\s*,?\s*/gi, "(")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*DETOKS AKTAR(?:\s+özel yapım)?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

// Yayın kapısı: Codex editöryal durumu "İNCELEME ÖNCESİ YAYIN YOK" olan kayıtlar (hastalık/sağlık iddiası, kimliği
// belirsiz ad, botanik kimlik) vitrine çıkmaz; veri silinmez, `HELD_PRODUCTS`te durur (red team RT-B-01/08, RT-A-14).
const HELD_STATUS = "İNCELEME ÖNCESİ YAYIN YOK";

function firstSentence(body: string) {
  const i = body.indexOf(". ");
  if (i > 24 && i < 180) return body.slice(0, i + 1);
  return body;
}

// Ürün görselleri (2026-09-22 görsel denetimi, kontak sayfası detox-assets/kontak/): public/products/sku/ altındaki
// 26 karenin 17'si gerçek stüdyo kâse çekimi ama içerik dosya adıyla uyuşmuyor (bal → granül, sabun → pul biber, yağ → kuru
// yaprak); onlar ürünle eşlenmez, Taha'nın foto formu (urun-bilgi.json) gelince gerçek fotoğraf bunları ezer. Kalan 9 kare
// üretilmiş natürmorttur: tür olarak uyumlu (şişe, kavanoz, lokum, sabun) ama ürünün kendisi değil — PDP'de "Temsili görsel."
const SKU_BY_ID: Record<string, string> = {
  DT117: "/products/sku/elma-sirkesi-detoks.jpg", // Elma sirkesi
  DT021: "/products/sku/sabun-lavanta.jpg", // Kabak lifli vücut sabunu (Lavanta)
  DT049: "/products/sku/gul-suyu.jpg", // Doğal gül suyu
  DT157: "/products/sku/tarhana.jpg", // Tarhana
  DT002: "/products/sku/gul-lokumu.jpg", // Gül lokumu
  DT001: "/products/sku/kiraz-visneli-lokum.jpg", // Kiraz ve vişneli lokum
  DT102: "/products/sku/cifte-tahin.jpg", // Çifte kavrulmuş tahin
  DT101: "/products/sku/uzum-pekmezi.jpg", // Üzüm pekmezi
  DT235: "/products/sku/bergamot-cay.jpg", // Bergamotlu siyah çay
};

// Vitrin 8: sirke, pekmez, tarhana, iki lokum, lavanta sabunu, gül suyu (temsili natürmort), çam balı (kategori görseli)
const FEATURED_IDS = ["DT117", "DT101", "DT157", "DT002", "DT001", "DT021", "DT049", "DT096"];

// Kategori yer tutucuları — hepsi tür-uyumlu üretilmiş natürmort ya da içeriği görülebilen gerçek kâse (spice: rezene tohumu).
const GALLERY: Record<CategoryId, string> = {
  lokum: "/products/lokum.jpg",
  soap: "/products/sku/sabun-lavanta.jpg",
  care: "/products/sku/gul-suyu.jpg",
  cream: "/products/hero-shop.jpg",
  essential: "/products/brass-scale.jpg",
  honey: "/products/still-life.jpg",
  pantry: "/products/sku/elma-sirkesi-detoks.jpg",
  nuts: "/products/nuts.jpg",
  dates: "/products/dates.jpg",
  salt: "/products/salt.jpg",
  flour: "/products/flour.jpg",
  form: "/products/coffee.jpg",
  spice: "/photos/taha-jars.jpg",
  oil: "/products/night-shelf.jpg",
};


export const SKU_IMAGE: Record<string, string> = {};

function imageForSource(id: string, category: CategoryId) {
  // öncelik: Taha'nın gerçek ürün fotoğrafı → vitrin SKU karesi → kategori görseli
  return productInfo(id)?.image ?? SKU_BY_ID[id] ?? GALLERY[category];
}

/** Kaynak fiyat listesindeki miktar+birim (131/226 kayıt: "100 g", "10 ml", "3 kg") → görünen net + kargo gramı. Uydurma yok: birim tanınmazsa null. */
function netFromSource(q: string | number | null, unit: string | null): { value: number; unit: "g" | "ml"; grams: number } | null {
  const v = typeof q === "number" ? q : Number(String(q ?? "").replace(",", "."));
  if (!Number.isFinite(v) || v <= 0 || !unit) return null;
  const u = unit.trim().toLowerCase();
  if (u === "g" || u === "gr") return { value: v, unit: "g", grams: v };
  if (u === "kg") return { value: v * 1000, unit: "g", grams: v * 1000 };
  if (u === "ml") return { value: v, unit: "ml", grams: v };
  if (u === "l" || u === "lt") return { value: v * 1000, unit: "ml", grams: v * 1000 };
  return null;
}

function adapt(row: SourceRecord): Product {
  const category = CAT_OVERRIDE[row.source_record_id] ?? CAT_MAP[row.source_category] ?? "spice";
  const info = productInfo(row.source_record_id);
  const name = titleStart(stripHouseSuffix(text(info?.nameTr, NAME_OVERRIDE[row.source_record_id], row.editorial_title_candidate, row.source_name)));
  const slug = slugify(name);
  const image = imageForSource(row.source_record_id, category);
  if (info?.image || SKU_BY_ID[row.source_record_id]) SKU_IMAGE[slug] = image;
  const hook = text(row.editorial_hook_candidate);
  const story = text(row.editorial_story_candidate);
  const shelf = SHELF[category];
  const blurb = text(hook, story ? firstSentence(story) : "", shelf, name);
  return {
    slug,
    sourceId: row.source_record_id,
    name,
    category,
    priceEur: parsePrice(row.source_price),
    unit: info?.unit ?? (row.source_price_basis || "ürün"),
    grams: info?.grams ?? netFromSource(row.source_quantity, row.source_unit)?.grams ?? null,
    net: info?.grams != null ? { value: info.grams, unit: "g" } : netFromSource(row.source_quantity, row.source_unit),
    kind: kindFor(category),
    klass: klassFor(category),
    image,
    blurb,
    publish: false,
    houseNamed: /detoks aktar/i.test(row.source_name),
    storyTitle: text(hook, name) || undefined,
    storyBody: text(story, hook, shelf) || undefined,
    reviewFlags: row.review_flags ?? [],
    info,
  };
}

const used = new Set<string>();
const ALL_PRODUCTS: Product[] = (raw as SourceRecord[]).map((row) => {
  const product = adapt(row);
  let slug = product.slug;
  if (used.has(slug)) slug = `${slug}-${row.source_record_id.toLowerCase()}`;
  used.add(slug);
  return { ...product, slug };
});
const HELD_IDS = new Set((raw as SourceRecord[]).filter((r) => r.editorial_status === HELD_STATUS).map((r) => r.source_record_id));
/** Vitrindeki ürünler (yayın kapısından geçenler). */
export const PRODUCTS: Product[] = ALL_PRODUCTS.filter((p) => !HELD_IDS.has(p.sourceId));
/** Yayını bekletilen ürünler — yalnız iç uyum sayfası ve raporlar için. */
export const HELD_PRODUCTS: Product[] = ALL_PRODUCTS.filter((p) => HELD_IDS.has(p.sourceId));

export function productBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productBySourceId(id: string) {
  return PRODUCTS.find((p) => p.sourceId === id);
}

export function productsByCategory(id: CategoryId) {
  return PRODUCTS.filter((p) => p.category === id);
}

export function categoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

export function featured() {
  return FEATURED_IDS.map(productBySourceId).filter(Boolean) as Product[];
}

/** Görsel bu ürünün kendi fotoğrafı mı (Taha'nın çekimi, urun-bilgi.json)? SKU natürmortları ve kategori görselleri temsilidir. */
export function imageIsExact(slug: string) {
  const product = productBySlug(slug);
  return Boolean(product?.info?.image);
}

export function imageFor(p: Product) {
  return p.info?.image ?? SKU_BY_ID[p.sourceId] ?? p.image;
}

/** Stokta yok = Taha stok girdi ve 0; stok bilgisi yoksa satılabilir sayılır (bilinmeyen, uydurulmaz). */
export function outOfStock(p: Product) {
  return p.info?.stock === 0;
}

export function categoryImage(id: CategoryId) {
  return GALLERY[id] ?? "/products/still-life.jpg";
}

export function imageCrop(_slug: string) {
  return "50% 50%";
}

export function imageTall(slug: string) {
  return imageIsExact(slug);
}

export function isHouseNamed(slug: string) {
  const product = productBySlug(slug);
  return Boolean(product?.houseNamed);
}

export function searchProducts(q: string, extra?: (p: Product) => string[]) {
  const needle = q.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return PRODUCTS;
  return PRODUCTS.filter((p) => {
    const hay = [p.name, p.blurb, p.sourceId, ...(extra?.(p) ?? [])].join(" ").toLocaleLowerCase("tr-TR");
    return hay.includes(needle);
  });
}

export { SKU_BY_ID };
