import { type FormEvent, useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/use-locale";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Toaster } from "sonner";
import { BrandMark } from "./brand-mark";
import { JsonLd } from "./json-ld";
import { LocaleLink } from "./locale-link";
import { ScrollProgress } from "./scroll-progress";
import { ShopFacts } from "./shop-facts";
import { Button } from "./ui/button";
import { COUNTRIES } from "@/lib/markets";
import { countryName, localeMeta, t, type Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n-locales";
import { applyLang } from "@/lib/lang-search";
import {
  BRAND,
  faqJsonLd,
  hreflangOf,
  liveOrigin,
  localeFromSearch,
  orgJsonLd,
  personJsonLd,
  websiteJsonLd,
  withLang,
} from "@/lib/seo";
import { SHOP_FACTS, SOCIAL, shopCity } from "@/lib/social";
import { bootShop, countItems, useShop } from "@/lib/store";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const urlSearch = useRouterState({ select: (s) => s.location.search }) as {
    lang?: string;
    q?: string;
  };
  const locale = useLocale();
  const setLocale = useShop((s) => s.setLocale);
  const country = useShop((s) => s.country);
  const setCountry = useShop((s) => s.setCountry);
  const n = useShop((s) => countItems(s.cart));
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    bootShop();
  }, []);

  useEffect(() => {
    const fromUrl = localeFromSearch({ lang: urlSearch.lang });
    if (fromUrl !== useShop.getState().locale) setLocale(fromUrl);
  }, [urlSearch.lang, setLocale]);

  // URL'de dil yoksa kayıtlı tercihe dön (kaymak kıyası deneyim-02'nin ikinci yarısı). Tarayıcı dili SUNUCUDA
  // Accept-Language ile kararlaştırılır (__root loader): istemcide yönlendirmek hidrasyon uyuşmazlığı veriyordu (React #418).
  const dilDenendi = useRef(false);
  useEffect(() => {
    if (dilDenendi.current || urlSearch.lang) return;
    dilDenendi.current = true;
    const kayitli = useShop.getState().locale;
    if (kayitli === "tr") return;
    const id = setTimeout(() => {
      void navigate({ search: ((prev: Record<string, unknown>) => applyLang(prev, kayitli)) as never, replace: true, resetScroll: false });
    }, 0);
    return () => clearTimeout(id);
  }, [urlSearch.lang, navigate]);

  useEffect(() => {
    if (typeof urlSearch.q === "string") setQ(urlSearch.q);
  }, [urlSearch.q]);

  useEffect(() => {
    document.documentElement.lang = localeMeta(locale).html;
  }, [locale]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function changeLocale(next: Locale) {
    setLocale(next);
    setOpen(false);
    void navigate({
      search: ((prev: Record<string, unknown>) => applyLang(prev, next)) as never,
      replace: true,
      resetScroll: false,
    });
  }

  function search(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    void navigate({
      to: "/shop",
      search: applyLang({ q: query || undefined } as Record<string, unknown>, locale) as never,
    });
    setOpen(false);
  }

  const nav = [
    { to: "/shop" as const, label: t(locale, "nav.shop") },
    { to: "/hikaye" as const, label: t(locale, "nav.story") },
    { to: "/iletisim" as const, label: t(locale, "nav.contact") },
  ];

  const origin = liveOrigin();
  const urlLocale = localeFromSearch({ lang: urlSearch.lang });
  const jsonLd = [
    orgJsonLd(origin, urlLocale),
    personJsonLd(origin),
    websiteJsonLd(origin, urlLocale),
    faqJsonLd(origin, urlLocale),
  ];

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--dt-raised)",
            color: "var(--dt-fg)",
            border: "1px solid var(--dt-border)",
            fontFamily: "var(--dt-sans)",
          },
        }}
      />
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[80] focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        {t(locale, "nav.skip")}
      </a>
      {/* Önizleme şeridi yalnız geliştirmede ya da VITE_ONIZLEME=1 ile; yayında "önizleme" kelimesi güveni kırar (red team RT-A-11) */}
      {(import.meta.env.DEV || import.meta.env.VITE_ONIZLEME === "1") && (
        <div className="flex items-center justify-between gap-3 border-b border-rule bg-ink/90 shell-x py-2.5 text-[0.75rem] tracking-[0.08em] text-cream/80">
          <p className="min-w-0 truncate">{t(locale, "banner.preview")}</p>
        </div>
      )}

      <header className="glass-bar sticky top-0 z-30">
        <div className="flex h-16 items-center justify-between gap-4 shell-x">
          <LocaleLink to="/" className="min-w-0" aria-label={BRAND}>
            <BrandMark size="nav" />
            <span className="mt-0.5 block font-sans text-[0.625rem] font-medium tracking-[0.2em] text-muted uppercase">
              {shopCity(locale)}
            </span>
          </LocaleLink>
          <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label={t(locale, "nav.menu")}>
            {nav.map((item) => {
              const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <LocaleLink
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center transition-colors ${
                    isActive ? "text-primary" : "text-fg/90 hover:text-primary"
                  }`}
                >
                  {item.label}
                </LocaleLink>
              );
            })}
            <a
              href={SOCIAL.instagram.href}
              target="_blank"
              rel="me noopener noreferrer"
              className="inline-flex min-h-11 items-center text-fg/90 transition-colors hover:text-primary"
            >
              Instagram
              <span className="sr-only"> ({t(locale, "nav.external")})</span>
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <form onSubmit={search} className="hidden md:block" role="search">
              <label className="relative block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t(locale, "nav.search")}
                  aria-label={t(locale, "nav.search")}
                  className="h-11 w-44 border-0 border-b border-border bg-transparent pr-3 pl-9 text-sm text-fg transition-colors placeholder:text-faint focus:border-primary"
                />
              </label>
            </form>
            <label className="hidden lg:flex">
              <span className="sr-only">{t(locale, "nav.language")}</span>
              <select
                value={locale}
                onChange={(e) => changeLocale(e.target.value as Locale)}
                className="h-11 max-w-28 cursor-pointer border-0 bg-transparent text-sm text-fg"
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-ink text-fg">
                    {l.native}
                  </option>
                ))}
              </select>
            </label>
            <label className="hidden lg:flex" title={t(locale, "nav.countryHint")}>
              <span className="sr-only">{t(locale, "nav.country")}</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as typeof country)}
                className="h-11 max-w-32 cursor-pointer border-0 bg-transparent text-sm text-fg"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-ink text-fg">
                    {countryName(c.code, locale)}
                  </option>
                ))}
              </select>
            </label>
            <LocaleLink
              to="/sepet"
              className="relative inline-flex size-11 items-center justify-center"
              aria-label={t(locale, "nav.cartCount", { n })}
            >
              <ShoppingBag className="size-5" />
              {n > 0 && (
                <span className="absolute top-1 right-1 min-w-4 rounded-[2px] bg-primary px-1 text-center font-mono text-[10px] text-on-primary tabular-nums">
                  {n}
                </span>
              )}
            </LocaleLink>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={t(locale, "nav.menu")}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div id="mobile-nav" className="border-t border-border bg-bg lg:hidden">
            <div className="shell-x py-4">
              <form onSubmit={search} role="search">
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t(locale, "nav.search")}
                  aria-label={t(locale, "nav.search")}
                  className="h-11 w-full border border-border bg-bg px-3 text-fg placeholder:text-faint focus:border-primary"
                />
              </form>
              <nav className="mt-3 divide-y divide-border" aria-label={t(locale, "nav.menu")}>
                {nav.map((item) => (
                  <LocaleLink
                    key={item.to}
                    to={item.to}
                    className="flex min-h-11 items-center transition-colors hover:text-primary"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </LocaleLink>
                ))}
                <a
                  href={SOCIAL.instagram.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="flex min-h-11 items-center transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Instagram {SOCIAL.instagram.handle}
                  <span className="sr-only"> ({t(locale, "nav.external")})</span>
                </a>
              </nav>
              <div className="mt-4 space-y-2">
                <label className="block">
                  <span className="sr-only">{t(locale, "nav.language")}</span>
                  <select
                    value={locale}
                    onChange={(e) => changeLocale(e.target.value as Locale)}
                    className="h-11 w-full border border-border bg-bg px-2 text-fg"
                  >
                    {LOCALES.map((l) => (
                      <option key={l.code} value={l.code} className="bg-ink text-fg">
                        {l.native}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block" title={t(locale, "nav.countryHint")}>
                  <span className="sr-only">{t(locale, "nav.country")}</span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as typeof country)}
                    className="h-11 w-full border border-border bg-bg px-2 text-fg"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-ink text-fg">
                        {countryName(c.code, locale)} {c.currency}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="icerik">
        <JsonLd data={jsonLd} />
        {children}
      </main>

      <footer className="border-t border-rule bg-ink text-fg">
        <div className="shell-x pt-16 pb-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p>
                <BrandMark size="footer" />
              </p>
              <p className="mt-4 max-w-[36ch] text-sm text-muted text-pretty">{t(locale, "footer.about")}</p>
              <div className="mt-5 space-y-2 text-sm">
                <a
                  href={SOCIAL.instagram.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="block text-fg/80 transition-colors hover:text-primary"
                >
                  Instagram {SOCIAL.instagram.handle}
                  <span className="sr-only"> ({t(locale, "nav.external")})</span>
                </a>
                <a
                  href={SOCIAL.facebook.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-fg/80 transition-colors hover:text-primary"
                >
                  Facebook
                  <span className="sr-only"> ({t(locale, "nav.external")})</span>
                </a>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <LocaleLink to="/shop" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "nav.shop")}
              </LocaleLink>
              <LocaleLink to="/paket" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "footer.gift")}
              </LocaleLink>
              <LocaleLink to="/hikaye" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "nav.story")}
              </LocaleLink>
              <LocaleLink to="/iletisim" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "nav.contact")}
              </LocaleLink>
            </div>
            <div className="space-y-2 text-sm">
              <LocaleLink to="/teslimat" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "footer.ship")}
              </LocaleLink>
              <LocaleLink to="/ticari" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "footer.trade")}
              </LocaleLink>
              <LocaleLink to="/yasal" className="block min-h-11 py-2 text-fg/80 transition-colors hover:text-primary">
                {t(locale, "nav.legal")}
              </LocaleLink>
            </div>
            <ShopFacts title={SHOP_FACTS.shop} />
          </div>
          <p className="mt-10 max-w-[52ch] border-t border-border pt-6 text-sm text-muted text-pretty">
            {t(locale, "footer.legal")}
          </p>
          <nav
            aria-label={t(locale, "nav.language")}
            className="mt-10 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-5 font-mono text-[0.6875rem] tracking-wide text-faint"
          >
            {LOCALES.map((l) => (
              <a
                key={l.code}
                href={withLang(pathname, l.code)}
                hrefLang={hreflangOf(l.code)}
                rel="alternate"
                className={`inline-flex min-h-11 items-center ${l.code === locale ? "text-fg" : "hover:text-fg"}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  changeLocale(l.code);
                }}
              >
                {l.native}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[0.6875rem] text-faint">
            {(import.meta.env.DEV || import.meta.env.VITE_ONIZLEME === "1") && <p>{t(locale, "footer.demo")}</p>}
            <p>
              © {new Date().getFullYear()} {BRAND}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
