import { LocaleLink } from "./locale-link";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { imageFor, imageIsExact, type Product } from "@/lib/catalog";
import { categoryTitle, productName, t } from "@/lib/i18n";
import { formatListed } from "@/lib/money";
import { isHouseNamed } from "@/lib/stories";
import { useCurrency } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const currency = useCurrency();
  const locale = useLocale();
  const house = isHouseNamed(product.slug);
  const exact = imageIsExact(product.slug);

  return (
    <article className="group">
      <LocaleLink to="/p/$slug" params={{ slug: product.slug }} className="block">
        <div className="overflow-hidden rounded-[6px] border border-border bg-ink transition-colors duration-300 group-hover:border-rule">
          <Pic
            src={imageFor(product)}
            alt={productName(product, locale)}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
            decoding="async"
            className={`img-in aspect-square w-full transition-transform duration-500 ease-out ${
              exact
                ? "object-contain p-3 group-hover:scale-[1.02]"
                : "object-cover group-hover:scale-[1.03]"
            }`}
          />
        </div>
        <p className={`micro mt-3 ${house ? "text-patina" : "text-faint"}`}>
          {t(locale, house ? "product.made" : "product.picked")}
        </p>
        <h3 className="mt-2 text-[1.15rem] font-medium leading-snug text-fg">
          {productName(product, locale)}
        </h3>
        <p className="mt-1 text-sm text-muted">{categoryTitle(product.category, locale)}</p>
        <p className="mt-2 text-base font-semibold text-primary tabular-nums">
          {formatListed(product.priceEur, product.unit, currency, locale)}
        </p>
      </LocaleLink>
    </article>
  );
}
