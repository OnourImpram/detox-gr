import { trapDialogTab } from '@/lib/dialog-focus';
import { sceneCopy } from '@/lib/scene-copy';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, Search, ShoppingBag, X, ArrowUpRight } from 'lucide-react';
import { Toaster } from 'sonner';
import { BrandMark } from './brand-mark';
import { LocaleLink } from './locale-link';
import { ShopFacts } from './shop-facts';
import { COUNTRIES } from '@/lib/markets';
import { countryName, t, type Locale } from '@/lib/i18n';
import { LOCALES } from '@/lib/i18n-locales';
import { applyLang } from '@/lib/lang-search';
import { localeUrl } from '@/lib/locale-navigation';
import { BRAND } from '@/lib/seo';
import { SHOP_FACTS, SOCIAL, shopCity } from '@/lib/social';
import { bootShop, countItems, useShop } from '@/lib/store';
import { useLocale } from '@/lib/use-locale';
import { usePaymentsEnabled } from '@/lib/payments';
import { ux } from '@/lib/storefront-copy';
import { b } from '@/lib/brand-copy';
import { r } from '@/lib/refinement-copy';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useRouterState({ select: state => state.location });
  const loading = useRouterState({ select: state => state.isLoading });
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  const country = useShop(state => state.country);
  const setCountry = useShop(state => state.setCountry);
  const setLocale = useShop(state => state.setLocale);
  const count = useShop(state => countItems(state.cart));
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => { bootShop(); }, []);
  useEffect(() => { setLocale(locale); }, [locale, setLocale]);
  useEffect(() => { setOpen(false); }, [location.pathname, locale]);
  useEffect(() => {
    if (loading || previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    const frame = requestAnimationFrame(() => {
      document.getElementById('icerik')?.focus({ preventScroll: true });
      setAnnouncement(document.querySelector('main h1')?.textContent ?? document.title);
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, loading]);
  useEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    if (!open) { if (panel.open) panel.close(); return; }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!panel.open) panel.showModal();
    searchInput.current?.focus();
    const wide = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (wide.matches) setOpen(false); };
    wide.addEventListener('change', resize);
    return () => { document.body.style.overflow = originalOverflow; wide.removeEventListener('change', resize); };
  }, [open]);
  function closeMenu() { setOpen(false); trigger.current?.focus({ preventScroll: true }); }
  function changeLocale(next: Locale) {
    setOpen(false);
    void navigate({ search: ((previous: Record<string, unknown>) => applyLang(previous, next)) as never, replace: true, resetScroll: false });
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim().slice(0, 120);
    void navigate({ to: '/shop', search: applyLang({ q, page: 1 }, locale) as never });
    setOpen(false);
  }
  const nav = [
    { to: '/shop', label: t(locale, 'nav.shop') },
    { to: '/hikaye', label: t(locale, 'nav.story') },
    { to: '/paket', label: t(locale, 'footer.gift') },
    { to: '/iletisim', label: t(locale, 'nav.contact') },
  ] as const;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = base && !location.pathname.startsWith(`${base}/`) && location.pathname !== base ? `${base}${location.pathname}` : location.pathname;
  const activePath = base && path.startsWith(`${base}/`) ? path.slice(base.length) : path;
  const countrySelect = <label className="dt-country"><span>{t(locale, 'nav.country')}</span><select value={country} onChange={event => setCountry(event.target.value as typeof country)}>{COUNTRIES.map(item => <option value={item.code} key={item.code}>{countryName(item.code, locale)}</option>)}</select></label>;
  return <div className="min-h-dvh bg-bg text-fg">
    <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--dt-raised)', color: 'var(--dt-fg)', border: '1px solid var(--dt-border)', fontFamily: 'var(--dt-sans)' } }} />
    <a href="#icerik" className="customer-skip">{t(locale, 'nav.skip')}</a>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    {!payments && <div className="dt-preview-bar shell-x" data-testid="preview-notice"><strong>{b(locale, 'preview.title')}</strong><p>{b(locale, 'preview.body')}</p></div>}
    <header className="dt-site-header" data-loading={loading}>
      <div className="dt-header-row shell-x">
        <LocaleLink to="/" className="dt-wordmark" aria-label={BRAND}><BrandMark size="nav" /><span>{shopCity(locale)}</span></LocaleLink>
        <nav className="dt-desktop-nav" aria-label={t(locale, 'nav.menu')}>{nav.map(item => <LocaleLink key={item.to} to={item.to} aria-current={activePath === item.to || activePath.startsWith(`${item.to}/`) ? 'page' : undefined}>{item.label}</LocaleLink>)}</nav>
        <div className="dt-header-actions">
          <label><span className="sr-only">{t(locale, 'nav.language')}</span><select className="dt-language-select" value={locale} onChange={event => changeLocale(event.target.value as Locale)}>{LOCALES.map(language => <option key={language.code} value={language.code}>{language.native}</option>)}</select></label>
          <LocaleLink to="/sepet" className="dt-cart-link" aria-label={payments ? t(locale, 'nav.cartCount', { n: count }) : `${ux(locale, 'selection')}, ${count}`}><ShoppingBag size={19} aria-hidden="true" /><span className="customer-list-label">{ux(locale, 'selection')}</span>{count > 0 && <span className="customer-list-count">{count}</span>}</LocaleLink>
          <button type="button" ref={trigger} className="dt-menu-button" onClick={() => setOpen(true)} aria-label={t(locale, 'nav.menu')} aria-expanded={open} aria-controls="mobile-nav"><Menu size={21} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="dt-country-row shell-x">{countrySelect}<form className="v3-quick-search" role="search" onSubmit={search}><label className="sr-only" htmlFor="desktop-search">{t(locale, 'nav.search')}</label><input id="desktop-search" type="search" name="q" maxLength={120} placeholder={r(locale, 'searchHint')} autoComplete="off" /><button type="submit" aria-label={t(locale, 'nav.search')}><Search size={17} aria-hidden="true" /></button></form></div>
    </header>
    <dialog id="mobile-nav" ref={dialog} className="customer-menu" onKeyDown={trapDialogTab} aria-labelledby="mobile-menu-title" onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => setOpen(false)}>
      <div className="customer-menu__heading"><h2 id="mobile-menu-title">{t(locale, 'nav.menu')}</h2><button type="button" onClick={closeMenu} aria-label={r(locale, 'close')}><X size={24} aria-hidden="true" /></button></div>
      <form onSubmit={search} role="search"><label htmlFor="mobile-search">{t(locale, 'nav.search')}</label><div className="dt-search-field"><input ref={searchInput} id="mobile-search" name="q" type="search" maxLength={120} placeholder={r(locale, 'searchHint')} /><button type="submit" aria-label={t(locale, 'nav.search')}><Search size={18} aria-hidden="true" /></button></div></form>
      <nav aria-label={t(locale, 'nav.menu')}>{nav.map(item => <LocaleLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink>)}</nav>
      {countrySelect}
      <div className="customer-menu__secondary"><LocaleLink to="/raf" onClick={() => setOpen(false)}>{b(locale, 'archive.title')}</LocaleLink><LocaleLink to="/notlar" onClick={() => setOpen(false)}>{b(locale, 'journal.title')}</LocaleLink><LocaleLink to="/teslimat" onClick={() => setOpen(false)}>{t(locale, 'footer.ship')}</LocaleLink></div>
    </dialog>
    <main id="icerik" tabIndex={-1} aria-busy={loading}>{children}</main>
    <footer className="dt-footer shell-x">
      <div className="dt-footer__grid">
        <div><BrandMark size="footer" /><p className="dt-footer__about">{b(locale, 'footer.line')}</p><a href={SOCIAL.instagram.href} target="_blank" rel="me noopener noreferrer" className="dt-text-link">Instagram {SOCIAL.instagram.handle}<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only">{t(locale, 'nav.external')}</span></a></div>
        <nav className="dt-footer__links" aria-label={t(locale, 'nav.menu')}>{nav.map(item => <LocaleLink key={item.to} to={item.to}>{item.label}</LocaleLink>)}<LocaleLink to="/raf">{b(locale, 'archive.title')}</LocaleLink><LocaleLink to="/kompozisyonlar">{sceneCopy(locale, 'title')}</LocaleLink><LocaleLink to="/notlar">{b(locale, 'journal.title')}</LocaleLink><LocaleLink to="/teslimat">{t(locale, 'footer.ship')}</LocaleLink><LocaleLink to="/ticari">{t(locale, 'footer.trade')}</LocaleLink><LocaleLink to="/yasal">{t(locale, 'nav.legal')}</LocaleLink></nav>
        <ShopFacts title={SHOP_FACTS.shop} />
      </div>
      <details className="customer-footer-languages"><summary>{t(locale, 'nav.language')}</summary><nav className="dt-footer__languages" aria-label={t(locale, 'nav.language')}>{LOCALES.map(language => <a key={language.code} href={localeUrl(`${path}${location.searchStr}${location.hash ? `#${location.hash.replace(/^#/, '')}` : ''}`, language.code)} hrefLang={language.html} aria-current={language.code === locale ? 'true' : undefined} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); changeLocale(language.code); }}>{language.native}</a>)}</nav></details>
      <div className="dt-footer__bottom"><p>© {new Date().getFullYear()} {BRAND}</p><p>{shopCity(locale)} · Taha Hüseyinoğlu</p></div>
    </footer>
  </div>;
}
