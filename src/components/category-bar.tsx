import { LocaleLink } from "./locale-link";
import { useLocale } from "@/lib/use-locale";
import { CATEGORIES, type CategoryId, productsByCategory } from "@/lib/catalog";
import { categoryTitle, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function CategoryBar({ active }: { active?: CategoryId | "all" }) {
  const locale = useLocale();
  const chip = (on: boolean) =>
    cn(
      "inline-flex h-11 shrink-0 items-center border px-4 text-sm transition-colors",
      on
        ? "border-primary text-primary"
        : "border-border hover:border-primary hover:text-primary",
    );
  return (
    <div className="bar-breakout sticky top-16 z-20 border-b border-border bg-bg/92 py-3 backdrop-blur-md">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <LocaleLink
          to="/shop"
          aria-current={!active || active === "all" ? "page" : undefined}
          className={chip(!active || active === "all")}
        >
          {t(locale, "home.all")}
        </LocaleLink>
        {CATEGORIES.filter((c) => productsByCategory(c.id).length > 0).map((c) => (
          <LocaleLink
            key={c.id}
            to="/shop/$category"
            params={{ category: c.id }}
            aria-current={active === c.id ? "page" : undefined}
            className={chip(active === c.id)}
          >
            {categoryTitle(c.id, locale)}
          </LocaleLink>
        ))}
      </div>
    </div>
  );
}
