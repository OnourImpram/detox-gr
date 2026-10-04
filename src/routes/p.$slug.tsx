import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, MessageCircle, Minus, Plus } from "lucide-react";
import { LocaleLink } from "@/components/locale-link";
import { Pic } from "@/components/pic";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { imageFor, imageIsExact, productBySlug, type Product } from "@/lib/catalog";
import { categoryTitle, localeMeta, productBlurb, productName, t } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import { usePaymentsEnabled } from "@/lib/payments";
import { saleBlockers, MAX_ITEM_QUANTITY } from "@/lib/commerce-policy";
import { ux } from "@/lib/storefront-copy";
import { formatListed } from "@/lib/money";
import { related, useCurrency, useShop } from "@/lib/store";
import { SHOP_WHATSAPP } from "@/lib/shop-facts";
import { breadcrumbJsonLd, localeFromSearch, pageOrigin, productJsonLd, seoHead } from "@/lib/seo";
import { applyLang } from "@/lib/lang-search";

export const Route = createFileRoute("/p/$slug")({
  loader: ({ params }) => { if (!productBySlug(params.slug)) throw notFound(); },
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    const product = productBySlug(match.params.slug);
    if (!product) return {};
    const name = productName(product, locale);
    const origin = pageOrigin();
    return seoHead({ title: t(locale, "seo.product.title", { name }), description: productBlurb(product, locale), path: `/p/${product.slug}`, locale, origin, image: imageFor(product), ogType: "product", jsonLd: [
      breadcrumbJsonLd(origin, locale, [{ name: t(locale, "nav.shop"), path: "/shop" }, { name: categoryTitle(product.category, locale), path: `/shop/${product.category}` }, { name, path: `/p/${product.slug}` }]),
      productJsonLd(origin, locale, product),
    ] });
  },
  component: ProductRoute,
});

function ProductRoute() {
  const { slug } = Route.useParams();
  const product = productBySlug(slug);
  if (!product) throw notFound();
  return <ProductDetail key={product.sourceId} product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale();
  const currency = useCurrency();
  const payments = usePaymentsEnabled();
  const country = useShop(state => state.country);
  const add = useShop(state => state.add);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const exact = imageIsExact(product.slug);
  const name = productName(product, locale);
  const more = related(product);
  const blockers = saleBlockers(product, country, quantity);
  const blocked = payments ? blockers.length > 0 : country === "NO" && product.klass === "food";
  const label = payments ? t(locale, "product.listAdd") : ux(locale, "addToList");
  const info = product.info;
  const localized = info?.localized?.[locale];
  // Do not relabel a Turkish ingredient list as a translation. It remains visibly tagged.
  const infoRows = [
    ["product.ingredients", localized?.ingredients ?? info?.ingredients, localized?.ingredients ? locale : "tr"],
    ["product.allergens", localized?.allergens ?? info?.allergens, localized?.allergens ? locale : "tr"],
    ["product.origin", localized?.origin ?? info?.origin, localized?.origin ? locale : "tr"],
    ["product.producer", info?.producer, ""],
    ["product.inci", info?.inci, ""],
    ["product.responsiblePerson", info?.responsiblePerson, ""],
  ].filter(row => typeof row[1] === "string" && row[1].trim());
  const whatsapp = `${SHOP_WHATSAPP}?text=${encodeURIComponent(`${name}\n${product.sourceId}\n${country}\n${pageOrigin()}/p/${product.slug}?lang=${locale}`)}`;
  function addProduct() {
    if (blocked) return;
    const result = add(product.slug, quantity);
    if (result !== "ok") {
      toast(t(locale, result === "norway_food" ? "cart.norwayBlock" : "checkout.err.unknown"));
      return;
    }
    toast(payments ? t(locale, "product.added") : ux(locale, "listAdded"), { action: { label: payments ? t(locale, "nav.cart") : ux(locale, "selection"), onClick: () => { void navigate({ to: "/sepet", search: ((previous: Record<string, unknown>) => applyLang(previous, locale)) as never }); } } });
  }
  const qtyInput = <div className="dt-quantity" role="group" aria-label={t(locale, "product.qty")}>
    <button type="button" aria-label={`${t(locale, "product.qty")} −`} disabled={quantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={16} aria-hidden="true" /></button>
    <input type="number" inputMode="numeric" aria-label={t(locale, "product.qty")} min={1} max={MAX_ITEM_QUANTITY} step={1} value={quantity} onChange={event => setQuantity(Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(Number(event.target.value)) || 1)))} />
    <button type="button" aria-label={`${t(locale, "product.qty")} +`} disabled={quantity >= MAX_ITEM_QUANTITY} onClick={() => setQuantity(value => Math.min(MAX_ITEM_QUANTITY, value + 1))}><Plus size={16} aria-hidden="true" /></button>
  </div>;
  return <section className="dt-container dt-pdp">
    <nav className="dt-breadcrumb" aria-label={t(locale, "nav.shop")}><LocaleLink to="/shop">{t(locale, "nav.shop")}</LocaleLink><span aria-hidden="true">/</span><LocaleLink to="/shop/$category" params={{ category: product.category }}>{categoryTitle(product.category, locale)}</LocaleLink></nav>
    <div className="dt-pdp__layout">
      <figure className="dt-pdp__figure"><div className={`dt-pdp__image ${exact ? "is-exact" : ""}`}><Pic src={imageFor(product)} alt={`${name}. ${t(locale, exact ? "product.exact" : "product.illustrative")}`} fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" /></div><figcaption>{t(locale, exact ? "product.exact" : "product.illustrative")}</figcaption></figure>
      <div className="dt-pdp__information">
        <p className="kicker">{t(locale, product.houseNamed ? "product.made" : "product.picked")}</p><h1>{name}</h1>
        <p className="dt-pdp__price">{formatListed(product.priceEur, product.unit, currency, locale)}</p>
        <p className="dt-price-note">{ux(locale, info?.vatIncluded === true ? "vatIncluded" : "referencePrice")}</p>
        <p className="dt-pdp__blurb">{productBlurb(product, locale)}</p>
        <dl className="dt-product-facts">
          {product.net && <div><dt>{t(locale, "product.net")}</dt><dd>{new Intl.NumberFormat(localeMeta(locale).html).format(product.net.value)} {product.net.unit}</dd></div>}
          <div><dt>SKU</dt><dd>{product.sourceId}</dd></div>
          {infoRows.map(([key, value, language]) => <div key={key}><dt>{t(locale, key!)}{language && language !== locale ? ` (${language.toUpperCase()})` : ""}</dt><dd lang={language || undefined}>{value}</dd></div>)}
        </dl>
        {!payments && <p className="dt-notice">{ux(locale, "previewBody")}</p>}
        {payments && blockers.length > 0 && <p className="dt-notice">{ux(locale, "pendingSale")}</p>}
        {country === "NO" && product.klass === "food" && <p className="dt-notice">{t(locale, "cart.norwayBlock")}</p>}
        <div className="dt-pdp__actions">{qtyInput}<Button variant="primary" disabled={blocked || product.priceEur == null} onClick={addProduct}>{label}<ArrowRight size={17} aria-hidden="true" /></Button></div>
        <a className="dt-text-link dt-pdp__question" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />{t(locale, "product.askWhatsApp")}<span className="sr-only"> ({t(locale, "nav.external")})</span></a>
      </div>
    </div>
    {more.length > 0 && <section className="dt-related"><div className="dt-section-heading"><h2>{t(locale, "product.related")}</h2></div><div className="dt-product-grid">{more.map(item => <ProductCard key={item.sourceId} product={item} />)}</div></section>}
    <div className="dt-mobile-purchase"><span>{formatListed(product.priceEur, product.unit, currency, locale)}</span><Button size="sm" variant="primary" disabled={blocked || product.priceEur == null} onClick={addProduct}>{label}</Button></div>
  </section>;
}
