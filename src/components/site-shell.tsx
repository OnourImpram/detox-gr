import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, ArrowUpRight } from "lucide-react";
import { Toaster } from "sonner";
import { BrandMark } from "./brand-mark";
import { LocaleLink } from "./locale-link";
import { ShopFacts } from "./shop-facts";
import { COUNTRIES } from "@/lib/markets";
import { countryName, t, type Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n-locales";
import { applyLang } from "@/lib/lang-search";
import { localeUrl } from "@/lib/locale-navigation";
import { BRAND } from "@/lib/seo";
import { SHOP_FACTS, SOCIAL, shopCity } from "@/lib/social";
import { bootShop, countItems, useShop } from "@/lib/store";
import { useLocale } from "@/lib/use-locale";
import { usePaymentsEnabled } from "@/lib/payments";
import { ux } from "@/lib/storefront-copy";
import { b } from "@/lib/brand-copy";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  const country = useShop((state) => state.country);
  const setCountry = useShop((state) => state.setCountry);
  const setLocale = useShop((state) => state.setLocale);
  const count = useShop((state) => countItems(state.cart));
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => { bootShop(); }, []);
  useEffect(() => { setLocale(locale); }, [locale, setLocale]);
  useEffect(() => { setOpen(false); }, [location.pathname, locale]);
  useEffect(() => {
    if (!open) return;
    searchInput.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function changeLocale(next: Locale) {
    setOpen(false);
    void navigate({ search: ((previous: Record<string, unknown>) => applyLang(previous, next)) as never, replace: true, resetScroll: false });
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim().slice(0, 120);
    void navigate({ to: "/shop", search: applyLang({ q: query, page: 1 }, locale) as never });
    setOpen(false);
  }
  const nav = [
    { to: "/shop", label: t(locale, "nav.shop") },
    { to: "/hikaye", label: t(locale, "nav.story") },
    { to: "/raf", label: b(locale, "archive.title") },
    { to: "/iletisim", label: t(locale, "nav.contact") },
  ] as const;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = base && !location.pathname.startsWith(`${base}/`) && location.pathname !== base ? `${base}${location.pathname}` : location.pathname;
  const countrySelect = <label className="dt-country"><span>{t(locale, "nav.country")}</span><select value={country} onChange={(event) => setCountry(event.target.value as typeof country)}>{COUNTRIES.map((item) => <option value={item.code} key={item.code}>{countryName(item.code, locale)}</option>)}</select></label>;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Toaster position="bottom-right" toastOptions={{ style: { background: "var(--dt-raised)", color: "var(--dt-fg)", border: "1px solid var(--dt-border)", fontFamily: "var(--dt-sans)" } }} />
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[80] focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">{t(locale, "nav.skip")}</a>
      {!payments && <div className="dt-preview-bar shell-x" data-testid="preview-notice"><strong>{b(locale, "preview.title")}</strong><p>{b(locale, "preview.body")}</p></div>}
      <header className="dt-site-header">
        <div className="dt-header-row shell-x">
          <LocaleLink to="/" className="dt-wordmark" aria-label={BRAND}><BrandMark size="nav" /><span>{shopCity(locale)}</span></LocaleLink>
          <nav className="dt-desktop-nav" aria-label={t(locale, "nav.menu")}>{nav.map((item) => <LocaleLink key={item.to} to={item.to} aria-current={location.pathname === item.to || location.pathname.startsWith(`${item.to}/`) ? "page" : undefined}>{item.label}</LocaleLink>)}</nav>
          <div className="dt-header-actions">
            <label><span className="sr-only">{t(locale, "nav.language")}</span><select className="dt-language-select" value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>{LOCALES.map((language) => <option key={language.code} value={language.code}>{language.native}</option>)}</select></label>
            <LocaleLink to="/sepet" className="dt-cart-link" aria-label={payments ? t(locale, "nav.cartCount", { n: count }) : `${ux(locale, "selection")}, ${count}`}><ShoppingBag size={19} aria-hidden="true" />{count > 0 && <span>{count}</span>}</LocaleLink>
            <button type="button" ref={trigger} className="dt-menu-button" onClick={() => setOpen((value) => !value)} aria-label={t(locale, "nav.menu")} aria-expanded={open} aria-controls="mobile-nav">{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
          </div>
        </div>
        <div className="dt-country-row shell-x">{countrySelect}<LocaleLink to="/shop"><Search size={14} aria-hidden="true" />{t(locale, "nav.search")}</LocaleLink></div>
        {open && <div id="mobile-nav" className="dt-mobile-menu shell-x">
          <form onSubmit={search} role="search"><label className="sr-only" htmlFor="mobile-search">{t(locale, "nav.search")}</label><div className="dt-search-field"><Search size={18} aria-hidden="true" /><input ref={searchInput} id="mobile-search" name="q" type="search" maxLength={120} placeholder={t(locale, "nav.search")} /><button type="submit" aria-label={t(locale, "nav.search")}><ArrowUpRight size={18} aria-hidden="true" /></button></div></form>
          <nav aria-label={t(locale, "nav.menu")}>{nav.map((item) => <LocaleLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</LocaleLink>)}</nav>
          {countrySelect}
        </div>}
      </header>
      <main id="icerik" tabIndex={-1}>{children}</main>
      <footer className="dt-footer shell-x">
        <div className="dt-footer__grid">
          <div><BrandMark size="footer" /><p className="dt-footer__about">{b(locale, "footer.line")}</p><a href={SOCIAL.instagram.href} target="_blank" rel="me noopener noreferrer" className="dt-text-link">Instagram {SOCIAL.instagram.handle}<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only">{t(locale, "nav.external")}</span></a></div>
          <nav className="dt-footer__links" aria-label={t(locale, "nav.menu")}>{nav.map((item) => <LocaleLink key={item.to} to={item.to}>{item.label}</LocaleLink>)}<LocaleLink to="/notlar">{b(locale, "journal.title")}</LocaleLink><LocaleLink to="/paket">{t(locale, "footer.gift")}</LocaleLink><LocaleLink to="/teslimat">{t(locale, "footer.ship")}</LocaleLink><LocaleLink to="/ticari">{t(locale, "footer.trade")}</LocaleLink><LocaleLink to="/yasal">{t(locale, "nav.legal")}</LocaleLink></nav>
          <ShopFacts title={SHOP_FACTS.shop} />
        </div>
        <p className="dt-footer__legal">{b(locale, "preview.body")}</p>
        <nav className="dt-footer__languages" aria-label={t(locale, "nav.language")}>{LOCALES.map((language) => <a key={language.code} href={localeUrl(`${path}${location.searchStr}${location.hash ? `#${location.hash.replace(/^#/, "")}` : ""}`, language.code)} hrefLang={language.html} aria-current={language.code === locale ? "true" : undefined} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); changeLocale(language.code); }}>{language.native}</a>)}</nav>
        <div className="dt-footer__bottom"><p>© {new Date().getFullYear()} {BRAND}</p><p>{shopCity(locale)} · Taha Hüseyinoğlu</p></div>
      </footer>
    </div>
  );
}
