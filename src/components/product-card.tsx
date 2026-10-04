import { ArrowUpRight } from "lucide-react";
import { LocaleLink } from "./locale-link";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "./pic";
import { imageFor, imageIsExact, type Product } from "@/lib/catalog";
import { categoryTitle, productName, t } from "@/lib/i18n";
import { formatListed } from "@/lib/money";
import { ux } from "@/lib/storefront-copy";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const exact = imageIsExact(product.slug);
  const name = productName(product, locale);
  return (
    <article className="dt-product-card" data-product-id={product.sourceId}>
      <LocaleLink to="/p/$slug" params={{ slug: product.slug }} className="dt-product-card__link">
        <div className={`dt-product-card__media ${exact ? "is-exact" : ""}`}>
          <Pic src={imageFor(product)} alt={exact ? name : `${t(locale, "product.illustrative")} ${name}`} sizes="(min-width: 1200px) 25vw, (min-width: 640px) 33vw, 50vw" loading="lazy" decoding="async" />
          <span className="dt-product-card__arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
        </div>
        <p className="dt-product-card__caption">{t(locale, exact ? "product.exact" : "product.illustrative")}</p>
        <div className="dt-product-card__body">
          <p className="dt-product-card__shelf">{t(locale, product.houseNamed ? "product.made" : "product.picked")}</p>
          <h3>{name}</h3>
          <p className="dt-product-card__category">{categoryTitle(product.category, locale)}</p>
          {product.net && <p className="dt-product-card__quantity">{new Intl.NumberFormat(locale).format(product.net.value)} {product.net.unit}</p>}
          <p className="dt-product-card__price">{formatListed(product.priceEur, product.unit, "EUR", locale)}</p>
          {product.priceEur !== null && <p className="dt-product-card__price-note">{ux(locale, product.publish && product.info?.vatIncluded === true ? "vatIncluded" : "referencePrice")}</p>}
        </div>
      </LocaleLink>
    </article>
  );
}
