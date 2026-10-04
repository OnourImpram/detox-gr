import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { useState } from "react";
import { toast } from "sonner";
import { LocaleLink } from "@/components/locale-link";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { imageFor, imageIsExact, outOfStock, productBySlug } from "@/lib/catalog";
import {
  categoryTitle,
  classLabel,
  etaText,
  looksTurkish,
  productBlurb,
  productName,
  t,
} from "@/lib/i18n";
import { applyLang } from "@/lib/lang-search";
import { isHouseNamed, loc, productStory } from "@/lib/stories";
import {
  breadcrumbJsonLd,
  localeFromSearch,
  pageOrigin,
  productJsonLd,
  seoHead,
} from "@/lib/seo";
import { related, useCurrency, useShop } from "@/lib/store";
import { formatListed, formatMoney } from "@/lib/money";
import { shippingEur } from "@/lib/shipping";
import { SOCIAL } from "@/lib/social";
import { SHOP_WHATSAPP } from "@/lib/shop-facts";

export const Route = createFileRoute("/p/$slug")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    const product = productBySlug(match.params.slug);
    if (!product) return {};
    const origin = pageOrigin();
    const name = productName(product, locale);
    return seoHead({
      title: t(locale, "seo.product.title", { name }),
      description: productBlurb(product, locale),
      path: `/p/${product.slug}`,
      locale,
      origin,
      image: imageFor(product),
      ogType: "product",
      jsonLd: [
        breadcrumbJsonLd(origin, locale, [
          { name: t(locale, "nav.shop"), path: "/shop" },
          { name: categoryTitle(product.category, locale), path: `/shop/${product.category}` },
          { name, path: `/p/${product.slug}` },
        ]),
        productJsonLd(origin, locale, product),
      ],
    });
  },
  // Bilinmeyen slug: loader'da notFound → gerçek 404 + kök NotFound görünümü. Bileşen içinde fırlatmak SSR'da
  // hata sınırına düşüp 200 + "Something went wrong" basıyordu (red team RT-A-03 / RT-C-06).
  loader: ({ params }) => {
    if (!productBySlug(params.slug)) throw notFound();
  },
  component: ProductPage,
});

function splitCopy(body: string) {
  if (body.length < 180) return [body];
  const mid = Math.floor(body.length / 2);
  const i = body.indexOf(". ", mid);
  const j = i >= 0 ? i + 1 : body.indexOf(". ");
  if (j < 40) return [body];
  return [body.slice(0, j).trim(), body.slice(j).trim()].filter(Boolean);
}

function ProductPage() {
  const { slug } = Route.useParams();
  const product = productBySlug(slug);
  if (!product) throw notFound();
  const navigate = useNavigate();
  const country = useShop((s) => s.country);
  const locale = useLocale();
  const add = useShop((s) => s.add);
  const currency = useCurrency();
  const [qty, setQty] = useState(1);
  const more = related(product);
  const norwayFood = country === "NO" && product.klass === "food";
  const noPrice = product.priceEur == null;
  const stockOut = outOfStock(product);
  const info = product.info;
  const infoRows: [string, string][] = [
    ["product.ingredients", info?.ingredients],
    ["product.allergens", info?.allergens],
    ["product.origin", info?.origin],
    ["product.producer", info?.producer],
    ["product.bestBefore", info?.bestBefore],
    ["product.inci", info?.inci],
    ["product.responsiblePerson", info?.responsiblePerson],
  ].filter((r): r is [string, string] => Boolean(r[1]));
  // Gıdada içindekiler/alerjen doğrulanmadıysa sessiz kalma: kaymak her kartta "dükkâna sorun" diyor (kaymak kıyası icerik-02)
  const allergenUnknown = product.klass === "food" && !info?.allergens && !info?.ingredients;
  const story = productStory(product.slug);
  const house = isHouseNamed(product.slug);
  const exact = imageIsExact(product.slug);
  const name = productName(product, locale);
  const storyTitle = story ? loc(locale, story.title) : "";
  const showStoryHeading = Boolean(storyTitle && storyTitle.toLocaleLowerCase("tr-TR") !== name.toLocaleLowerCase("tr-TR"));
  // Anlatı yalnız TR yazılı; sözlük çevirisi metni değiştirmediyse TR paragraf EN/EL sayfaya sızıyordu (red team RT-C-07)
  const storyBody = story ? loc(locale, story.body) : "";
  const storyTranslated = Boolean(story && (locale === "tr" || !looksTurkish(storyBody + storyTitle)));
  const whatsappHref = `${SHOP_WHATSAPP}?text=${encodeURIComponent(`${name} — ${pageOrigin()}/p/${product.slug}`)}`;

  function addToCart() {
    const item = productBySlug(slug);
    if (!item || norwayFood || noPrice || stockOut) return;
    const result = add(item.slug, qty);
    if (result !== "ok") {
      toast(t(locale, result === "norway_food" ? "cart.norwayBlock" : result === "no_price" ? "product.netUnknown" : "checkout.err.unknown"));
      return;
    }
    toast(t(locale, "product.added"), {
      action: {
        label: t(locale, "nav.cart"),
        onClick: () => {
          void navigate({
            to: "/sepet",
            search: ((prev: Record<string, unknown>) => applyLang(prev, locale)) as never,
          });
        },
      },
    });
  }

  return (
    <section className="shell-x section-y">
      <nav aria-label={t(locale, "nav.shop")} className="micro flex flex-wrap items-center gap-x-2.5 text-faint">
        <LocaleLink to="/shop" className="transition-colors hover:text-primary">
          {t(locale, "nav.shop")}
        </LocaleLink>
        <span aria-hidden="true">/</span>
        <LocaleLink
          to="/shop/$category"
          params={{ category: product.category }}
          className="transition-colors hover:text-primary"
        >
          {categoryTitle(product.category, locale)}
        </LocaleLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="max-w-[28ch] truncate text-muted">
          {name}
        </span>
      </nav>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          {/* [UNVERIFIED] fetchPriority React 19 prop'u — React 18'de fetchpriority olarak yazılmalı */}
          <Pic
            src={imageFor(product)}
            alt={name}
            sizes="(min-width: 1024px) 55vw, 100vw"
            fetchPriority="high"
            decoding="async"
            className={`img-in max-h-[80vh] w-full rounded-[6px] border border-border bg-ink object-contain ${exact ? "p-4" : ""}`}
          />
          <p className="photo-credit">{t(locale, exact ? "product.exact" : "product.illustrative")}</p>
        </div>
        <div className="max-w-[58ch]">
          <p className={`micro ${house ? "text-patina" : "text-faint"}`}>
            {t(locale, house ? "product.made" : "product.picked")}
          </p>
          <h1 className="mt-3 text-[clamp(2.2rem,4.4vw,3.4rem)]">{name}</h1>
          <p className="mt-4 text-2xl font-semibold text-primary tabular-nums">
            {formatListed(product.priceEur, product.unit, currency, locale)}
          </p>
          <p className="mt-4 max-w-[52ch] border border-border bg-raised px-4 py-3 text-sm leading-relaxed text-patina">
            {t(locale, "product.confirmPrice")}
          </p>
          {story && storyTranslated && (
            <div className="mt-8">
              {showStoryHeading && <h2 className="text-2xl">{storyTitle}</h2>}
              {splitCopy(storyBody).map((para) => (
                <p key={para.slice(0, 24)} className={`${showStoryHeading ? "mt-3" : "mt-0"} leading-relaxed text-muted`}>
                  {para}
                </p>
              ))}
            </div>
          )}
          {!(story && storyTranslated) && (
            <p className="mt-6 text-muted">{productBlurb(product, locale)}</p>
          )}
          <dl className="mt-8 border-y border-rule">
            <div className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="micro text-faint">{t(locale, "product.class")}</dt>
              <dd className="text-sm">{classLabel(product.klass, locale)}</dd>
            </div>
            {product.net != null && (
              <div className="hairline-soft flex items-baseline justify-between gap-6 border-t py-3.5">
                <dt className="micro text-faint">{t(locale, "product.net")}</dt>
                <dd className="text-sm tabular-nums">{product.net.value} {product.net.unit}</dd>
              </div>
            )}
            {/* Taha'nın doğruladığı alanlar (urun-bilgi.json): yalnız dolu olan satır basılır, uydurma yok (red team RT-B-02/05) */}
            {allergenUnknown && (
              <div className="flex justify-between gap-6 py-3">
                <dt className="micro text-faint">{t(locale, "product.allergens")}</dt>
                <dd className="max-w-[32ch] text-right text-sm text-muted">{t(locale, "product.allergensUnknown")}</dd>
              </div>
            )}
            {infoRows.map(([key, value]) => (
              <div key={key} className="hairline-soft flex items-baseline justify-between gap-6 border-t py-3.5">
                <dt className="micro shrink-0 text-faint">{t(locale, key)}</dt>
                <dd className="text-right text-sm">{value}</dd>
              </div>
            ))}
            {/* Kargo tahmini karar anında: seçili ülke için bu ürün tek başına (red team RT-A-08) */}
            {!noPrice && !norwayFood && (
              <div className="hairline-soft flex items-baseline justify-between gap-6 border-t py-3.5">
                <dt className="micro text-faint">{t(locale, "product.shipFrom")}</dt>
                <dd className="text-sm tabular-nums">
                  {formatMoney(shippingEur(country, [{ product, qty }]), currency)} · {etaText(country, locale)}
                </dd>
              </div>
            )}
          </dl>
          {stockOut && (
            <p className="mt-4 border border-border bg-raised px-4 py-3 text-sm leading-relaxed text-muted">
              {t(locale, "product.outOfStock")}
            </p>
          )}
          {norwayFood && (
            <p className="mt-4 border border-border bg-raised px-4 py-3 text-sm leading-relaxed text-muted">
              {t(locale, "cart.norwayBlock")}
            </p>
          )}
          <div className="mt-8 hidden flex-wrap items-center gap-3 lg:flex">
            <label className="text-sm text-muted">
              {t(locale, "product.qty")}
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="ml-2 h-11 w-16 rounded-[4px] border border-border bg-bg px-2 tabular-nums"
              />
            </label>
            <Button variant="primary" disabled={norwayFood || noPrice || stockOut} onClick={addToCart}>
              {t(locale, "product.listAdd")}
            </Button>
            {/* WhatsApp birincil soru kanalı: diaspora kitlesi Instagram'dan çok WhatsApp kullanıyor (red team RT-A-13) */}
            <Button asChild variant="outline">
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                {t(locale, "product.askWhatsApp")}
              </a>
            </Button>
            <a href={SOCIAL.instagram.href} target="_blank" rel="noreferrer" className="text-sm text-muted underline-offset-4 hover:underline">
              {t(locale, "product.ask")}
            </a>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <div className="mt-20">
          <hr className="rule-line" aria-hidden="true" />
          <h2 className="mt-10 text-[clamp(2rem,4vw,3rem)]">{t(locale, "product.related")}</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sabit mobil barın alt içeriği örtmemesi için pay */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
      <div className="shell-x pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 pt-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-primary tabular-nums">
            {formatListed(product.priceEur, product.unit, currency, locale)}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            aria-label={t(locale, "product.whatsapp")}
            className="focus-inset flex size-10 shrink-0 items-center justify-center border border-border text-fg"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4 5.3 5.3 0 0 0 3.2.7 2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>
          </a>
          <Button variant="primary" size="sm" disabled={norwayFood || noPrice || stockOut} onClick={addToCart}>
            {t(locale, "product.listAdd")}
          </Button>
        </div>
      </div>
    </section>
  );
}
