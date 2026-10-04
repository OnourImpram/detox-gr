import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { ThemeRoot } from "@/components/theme-root";
import { parseLang } from "@/lib/lang-search";
import { localeMeta, t } from "@/lib/i18n";
import { loadPack, registerPack } from "@/lib/i18n-pack";
import { getPaymentsEnabled } from "@/lib/payments";
import { localeFromSearch } from "@/lib/seo";
import { localeUrl } from "@/lib/locale-navigation";
import appCss from "../styles.css?url";
import storefrontCss from "../styles/storefront.css?url";
import narrowCss from "../styles/narrow.css?url";

const STATIC_PREVIEW = import.meta.env.VITE_STATIC_PREVIEW === "1";

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>) => parseLang(search),
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  loader: async ({ deps, location }) => {
    if (!STATIC_PREVIEW && !deps.lang && import.meta.env.SSR) {
      const { getRequestHeader, setResponseHeader } = await import("@tanstack/react-start/server");
      const { bestLocale } = await import("@/lib/dil-pazarlik");
      setResponseHeader("vary", "accept-language");
      const preferred = bestLocale(getRequestHeader("accept-language"));
      if (preferred && preferred !== "tr") {
        throw redirect({ href: localeUrl(`${location.pathname}${location.searchStr}`, preferred), replace: true, headers: { vary: "accept-language" } });
      }
    }
    const locale = localeFromSearch(deps);
    const [pack, payments] = await Promise.all([loadPack(locale), STATIC_PREVIEW ? Promise.resolve(false) : getPaymentsEnabled()]);
    registerPack(locale, pack);
    return { locale, pack, payments };
  },
  head: ({ match }) => ({
    meta: [
      { title: t(localeFromSearch(match.search), "seo.notfound.title") },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1F130B" },
      { name: "author", content: "Taha Hüseyinoğlu" },
      ...(STATIC_PREVIEW ? [{ name: "robots", content: "noindex,nofollow" }] : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: storefrontCss },
      { rel: "stylesheet", href: narrowCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  component: Root,
});

function Root() {
  const data = Route.useLoaderData();
  registerPack(data.locale, data.pack);
  return (
    <html lang={localeMeta(data.locale).html} className="antialiased" data-theme="pine">
      <head><HeadContent /></head>
      <body><ThemeRoot><SiteShell><Outlet /></SiteShell></ThemeRoot><Scripts /></body>
    </html>
  );
}
