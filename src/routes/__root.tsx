import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { ThemeRoot } from "@/components/theme-root";
import { parseLang } from "@/lib/lang-search";
import { localeMeta, t } from "@/lib/i18n";
import { loadPack, registerPack } from "@/lib/i18n-pack";
import { getPaymentsEnabled } from "@/lib/payments";
import { localeFromSearch } from "@/lib/seo";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  validateSearch: (s: Record<string, unknown>) => parseLang(s),
  // Aktif dilin paketi (UI metni + sözlük) yalnız burada yüklenir: sunucuda SSR'dan önce, istemcide dil değişince.
  // Loader verisi HTML'e gömülür → hidrasyonda Root paketi çocuklardan önce kaydeder, İngilizce'ye düşme olmaz.
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  loader: async ({ deps, location }) => {
    // URL'de dil yoksa tarayıcının Accept-Language'ına bak (kaymak kıyası deneyim-02). Karar SUNUCUDA verilir:
    // istemcide yönlendirmek hidrasyon metin uyuşmazlığı veriyordu (React #418, ölçüldü 2026-09-22).
    if (!deps.lang && import.meta.env.SSR) {
      const { getRequestHeader, setResponseHeader } = await import("@tanstack/react-start/server");
      const { bestLocale } = await import("@/lib/dil-pazarlik");
      setResponseHeader("vary", "accept-language");
      const hedef = bestLocale(getRequestHeader("accept-language"));
      // Vary yönlendirmenin kendisine de konur: CDN Almanca için verilen 307'yi herkese servis etmesin (ölçüldü: 307'de eksikti)
      if (hedef && hedef !== "tr") {
        throw redirect({ href: `${location.pathname}?lang=${hedef}`, replace: true, headers: { vary: "accept-language" } });
      }
    }
    const locale = localeFromSearch(deps);
    const [pack, payments] = await Promise.all([loadPack(locale), getPaymentsEnabled()]);
    return { locale, pack, payments };
  },
  head: ({ match }) => ({
    meta: [
      // Yedek başlık: eşleşmeyen adres (404) kendi head'ini üretmiyor ve sayfa başlıksız kalıyordu (axe document-title, serious).
      // Rota kendi seoHead'ini basınca bu eziliyor.
      { title: t(localeFromSearch(match.search), "seo.notfound.title") },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1F130B" },
      { name: "author", content: "Taha Huseyinoglu" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      // Harici font CDN'i yasak — Syne/Figtree/IBM Plex Mono, styles.css'teki
      // @font-face bloklarıyla /public/fonts/ altından özbarındırılır.
    ],
  }),
  component: Root,
});

function Root() {
  const { lang } = Route.useSearch();
  const locale = localeFromSearch({ lang });
  const data = Route.useLoaderData();
  registerPack(data.locale, data.pack);
  return (
    <html lang={localeMeta(locale).html} className="antialiased" data-theme="pine" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeRoot>
          <SiteShell>
            <Outlet />
          </SiteShell>
        </ThemeRoot>
        <Scripts />
      </body>
    </html>
  );
}
