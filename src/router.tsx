import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { LocaleLink } from "@/components/locale-link";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  // Dil URL'den: eski sürüm sunucuda "tr"ye düşüp 404'ü her dilde Türkçe basıyordu (kaymak kıyası deneyim-10)
  const locale = useLocale();
  return (
    <section className="shell-x section-y">
      <p className="kicker">404</p>
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)]">{t(locale, "notfound.title")}</h1>
      <p className="mt-3 max-w-[48ch] text-muted">{t(locale, "notfound.lead")}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <LocaleLink to="/shop" className="text-primary underline underline-offset-4">
          {t(locale, "nav.shop")}
        </LocaleLink>
        <LocaleLink to="/iletisim" className="text-primary underline underline-offset-4">
          {t(locale, "nav.contact")}
        </LocaleLink>
        <LocaleLink to="/" className="text-muted underline underline-offset-4">
          {t(locale, "nav.home")}
        </LocaleLink>
      </div>
    </section>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
    defaultPreload: "intent",
  });
}
