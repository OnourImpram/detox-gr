import { countryName, localeMeta } from "@/lib/i18n";
import { AcikMi } from "@/components/acik-mi";
import { useLocale } from "@/lib/use-locale";
import {
  SHOP_HOURS,
  SHOP_MAPS,
  SHOP_PHONE_DISPLAY,
  SHOP_PHONE_TEL,
  SHOP_WHATSAPP,
} from "@/lib/shop-facts";
import { shopCity, shopStreet } from "@/lib/social";

/** Gün adlarını aktif dile göre Intl'den üretir — yeni i18n anahtarı gerekmez. */
function dayNames(htmlLang: string, days: readonly number[]): string {
  const fmt = new Intl.DateTimeFormat(htmlLang, { weekday: "short" });
  return days.map((d) => fmt.format(new Date(2024, 0, d))).join(" · ");
}

export function ShopFacts({
  title,
  withAddress = true,
  className = "",
}: {
  title?: string;
  withAddress?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const htmlLang = localeMeta(locale).html;

  return (
    <div className={className}>
      {title ? <p className="micro text-patina">{title}</p> : null}
      <div className={`space-y-4 text-sm ${title ? "mt-4" : ""}`}>
        {withAddress ? (
          <p>
            <a
              href={SHOP_MAPS}
              target="_blank"
              rel="noopener noreferrer"
              className="leading-relaxed transition-colors hover:text-primary"
            >
              {shopStreet(locale)}
              <br />
              {shopCity(locale)}, {countryName("GR", locale)}
            </a>
          </p>
        ) : null}
        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <a
            href={`tel:${SHOP_PHONE_TEL}`}
            className="tabular-nums transition-colors hover:text-primary"
          >
            {SHOP_PHONE_DISPLAY}
          </a>
          <a
            href={SHOP_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            WhatsApp
          </a>
        </p>
        <div className="space-y-1.5 border-t border-border pt-4">
          <AcikMi className="pb-1 text-muted" />
          {SHOP_HOURS.map((row) => (
            <p
              key={row.days.join("-")}
              className="flex flex-wrap items-baseline gap-x-3 font-mono text-[0.75rem]"
            >
              <span className="text-faint">{dayNames(htmlLang, row.days)}</span>
              <span className="tabular-nums text-muted">{row.slots.join("  ·  ")}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
