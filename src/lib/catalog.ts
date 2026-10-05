import { sourceProductSlugs, sourceProductTitle, cleanProductTitle, slugifySourceTitle } from "./catalog-address";
import { productMedia, ILLUSTRATION_BY_ID } from "./product-media";
import photoApprovals from "@/data/photo-approved.json";
import photoArchive from "@/data/photo-archive.json";
import { approvedPhotoPath } from "./photo-policy";
import raw from "@/data/catalog-vitrin.json";
import infoRaw from "@/data/urun-bilgi.json";
import commerceConfig from "@/data/commerce-config.json";

export type CategoryId = "lokum" | "soap" | "care" | "cream" | "essential" | "honey" | "pantry" | "nuts" | "dates" | "salt" | "flour" | "form" | "spice" | "oil";
export type ShipKind = "dry" | "glass" | "liquid";
export type ProductClass = "food" | "cosmetic" | "other";
export type ProductInfo = {
  grams?: number; unit?: string; ingredients?: string; allergens?: string; origin?: string;
  producer?: string; bestBefore?: string; inci?: string; responsiblePerson?: string;
  stock?: number; vatIncluded?: boolean; image?: string; images?: string[];
  nameTr?: string; nameEn?: string; note?: string;
  saleApproved?: boolean; labelReviewed?: boolean; approvedMarkets?: string[];
  productClass?: ProductClass;
  /** Reviewed display information. Missing translations never silently become Turkish paragraphs. */
  localized?: Record<string, { name?: string; ingredients?: string; allergens?: string; origin?: string; note?: string }>;
};
const INFO = infoRaw as Record<string, ProductInfo | string>;
export function productInfo(sourceId: string): ProductInfo | undefined {
  const value = INFO[sourceId];
  const info = value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
  const approvedImage = approvedPhotoPath(photoApprovals, sourceId, photoArchive.photos);
  return approvedImage ? { ...info, image: info?.image ?? approvedImage } : info;
}
export type Product = {
  slug: string; sourceId: string; name: string; category: CategoryId; priceEur: number | null;
  unit: string; grams: number | null; net: { value: number; unit: "g" | "ml" } | null;
  kind: ShipKind; klass: ProductClass; image: string | null; blurb: string; publish: boolean;
  houseNamed: boolean; storyTitle?: string; storyBody?: string; reviewFlags: string[]; info?: ProductInfo;
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
  Lokumlar: "lokum", Sabunlar: "soap", "Kişisel bakım ürünleri": "care", "Doğal kremler": "cream",
  "Esansiyel yağlar": "essential", Bal: "honey", Pekmez: "pantry", Kuruyemişler: "nuts", Hurma: "dates",
  Tuz: "salt", Un: "flour", "Zayıflama ve Form ürünleri": "form", "Baharatlar - Bitkiler": "spice", Yağlar: "oil",
};
const CAT_OVERRIDE: Record<string, CategoryId> = { DT157: "pantry", DT158: "pantry" };
const SHELF: Record<CategoryId, string> = {
  lokum: "Kahvenin yanında, sohbetin ortasında.", soap: "Gündelik bakımın küçük bir ayrıntısı.",
  care: "Taha’nın bakım rafından, her güne.", cream: "Cilt bakımında günlük bir dokunuş.",
  essential: "Cam şişede, aktarın aromatik rafı.", honey: "Kavanozda bir manzara.",
  pantry: "Kilerin kalbi — sirke, pekmez, tarhana.", nuts: "Sofranın kenarına, çayın yanına.",
  dates: "Hurma seçkisi. Tatlı bir ikram.", salt: "Mutfağın sessiz temeli.", flour: "Hamurun başladığı yer.",
  form: "Fincanın yanına küçük bir keşif.", spice: "Aktar rafının kokusu.", oil: "Mutfak ve bakım için Taha’nın yağ rafı.",
};
type SourceRecord = {
  source_record_id: string; source_name: string; source_category: string; source_price: string | null;
  source_price_basis: string | null; source_quantity: string | number | null; source_unit: string | null;
  editorial_title_candidate: string | null; editorial_story_candidate: string | null;
  editorial_hook_candidate: string | null; review_flags: string[]; editorial_status: string; publish: boolean;
};
function parsePrice(value: string | null): number | null {
  if (value == null || value === "") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 0 ? number : null;
}
function klassFor(category: CategoryId): ProductClass {
  if (["soap", "care", "cream", "essential"].includes(category)) return "cosmetic";
  return category === "form" ? "other" : "food";
}
function kindFor(category: CategoryId): ShipKind { return ["oil", "essential", "honey", "pantry"].includes(category) ? "glass" : "dry"; }
function text(...values: Array<string | null | undefined>) { return values.map(value => (value ?? "").trim()).find(Boolean) ?? ""; }
const HELD_STATUS = "İNCELEME ÖNCESİ YAYIN YOK";
function firstSentence(body: string) { const index = body.indexOf(". "); return index > 24 && index < 180 ? body.slice(0, index + 1) : body; }
/** Explicit v3 illustrations. No category-to-product image substitution. */
const SKU_BY_ID = ILLUSTRATION_BY_ID;
const FEATURED_IDS = ["DT117", "DT101", "DT157", "DT002", "DT001", "DT021", "DT049", "DT096"];
function netFromSource(quantity: string | number | null, unit: string | null): { value: number; unit: "g" | "ml"; grams: number } | null {
  const value = typeof quantity === "number" ? quantity : Number(String(quantity ?? "").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0 || !unit) return null;
  const normalized = unit.trim().toLowerCase();
  if (["g", "gr"].includes(normalized)) return { value, unit: "g", grams: value };
  if (normalized === "kg") return { value: value * 1000, unit: "g", grams: value * 1000 };
  // Volume-as-weight remains an estimate until packaging and carrier measurements are verified.
  if (normalized === "ml") return { value, unit: "ml", grams: value };
  if (["l", "lt"].includes(normalized)) return { value: value * 1000, unit: "ml", grams: value * 1000 };
  return null;
}
function adapt(row: SourceRecord): Product {
  const category = CAT_OVERRIDE[row.source_record_id] ?? CAT_MAP[row.source_category] ?? "spice";
  const info = productInfo(row.source_record_id);
  const sourceTitle = sourceProductTitle(row);
  const name = info?.nameTr ? cleanProductTitle(info.nameTr) : sourceTitle;
  const hook = text(row.editorial_hook_candidate);
  const story = text(row.editorial_story_candidate);
  const net = netFromSource(row.source_quantity, row.source_unit);
  return {
    // Correcting the displayed name no longer changes an existing product URL.
    slug: slugifySourceTitle(sourceTitle), sourceId: row.source_record_id, name, category,
    priceEur: parsePrice(row.source_price), unit: info?.unit ?? (row.source_price_basis || "ürün"),
    grams: info?.grams ?? net?.grams ?? null,
    net: info?.grams != null ? { value: info.grams, unit: "g" } : net,
    kind: kindFor(category),
    klass: info?.productClass && ["food", "cosmetic", "other"].includes(info.productClass) ? info.productClass : klassFor(category),
    image: productMedia({ sourceId: row.source_record_id, info }).src,
    blurb: text(hook, story ? firstSentence(story) : "", SHELF[category], name),
    publish: row.publish === true && row.editorial_status !== HELD_STATUS,
    houseNamed: /detoks aktar/i.test(row.source_name),
    storyTitle: text(hook, name) || undefined, storyBody: text(story, hook, SHELF[category]) || undefined,
    reviewFlags: row.review_flags ?? [], info,
  };
}
const productSlugs = sourceProductSlugs(raw as SourceRecord[]);
const ALL_PRODUCTS: Product[] = (raw as SourceRecord[]).map((row, index) => {
  const product = adapt(row);
  const slug = productSlugs[index];
  return { ...product, slug };
});
const HELD_IDS = new Set((raw as SourceRecord[]).filter(row => row.editorial_status === HELD_STATUS).map(row => row.source_record_id));
/** Preview browsing is intentionally separate from publication and checkout eligibility. */
export const PRODUCTS = ALL_PRODUCTS.filter(product => !HELD_IDS.has(product.sourceId)
  && (commerceConfig.mode !== "live" || (product.publish && product.info?.saleApproved === true && product.info?.labelReviewed === true)));
export const HELD_PRODUCTS = ALL_PRODUCTS.filter(product => HELD_IDS.has(product.sourceId));
export const PUBLISHED_PRODUCTS = PRODUCTS.filter(product => product.publish && product.info?.saleApproved === true && product.info?.labelReviewed === true);
export function productBySlug(slug: string) { return PRODUCTS.find(product => product.slug === slug); }
export function productBySourceId(id: string) { return PRODUCTS.find(product => product.sourceId === id); }
export function productsByCategory(id: CategoryId) { return PRODUCTS.filter(product => product.category === id); }
export function categoryById(id: string) { return CATEGORIES.find(category => category.id === id); }
export function featured() { return FEATURED_IDS.map(productBySourceId).filter((product): product is Product => Boolean(product)); }
export function imageIsExact(slug: string) { const product = productBySlug(slug); return product ? productMedia(product).kind === "verified" : false; }
export function imageFor(product: Product) { return productMedia(product).src; }
export function outOfStock(product: Product) { return product.info?.stock === 0; }
export function isHouseNamed(slug: string) { return Boolean(productBySlug(slug)?.houseNamed); }
export function searchProducts(query: string, extra?: (product: Product) => string[]) {
  const needle = query.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return PRODUCTS;
  return PRODUCTS.filter(product => [product.name, product.blurb, product.sourceId, ...(extra?.(product) ?? [])].join(" ").toLocaleLowerCase("tr-TR").includes(needle));
}
export { SKU_BY_ID };
