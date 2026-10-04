import { createRootRoute, HeadContent, Outlet, redirect, Scripts, useHydrated, ClientOnly, useRouterState } from "@tanstack/react-router";
import { ContentLocale, localeFromLoaderData } from "@/lib/content-locale";
import { SiteShell } from "@/components/site-shell";
import { ThemeRoot } from "@/components/theme-root";
import { parseLang } from "@/lib/lang-search";
import { localeMeta, t } from "@/lib/i18n";
import { loadBrandPack, registerBrandPack } from "@/lib/brand-copy";
import { loadPack, registerPack } from "@/lib/i18n-pack";
import { getPaymentsEnabled } from "@/lib/payments";
import { localeFromSearch } from "@/lib/seo";
import { localeUrl } from "@/lib/locale-navigation";
import v3Css from "../styles/v3.css?url";
import appCss from "../styles.css?url";
import storefrontCss from "../styles/storefront.css?url";
import narrowCss from "../styles/narrow.css?url";
import editorialCss from "../styles/editorial.css?url";

const STATIC_PREVIEW = import.meta.env.VITE_STATIC_PREVIEW === "1";

export const Route = createRootRoute({
  // A static shell cannot know the requested locale. Only the document is prerendered.
  // Otherwise ?lang changes the root match ID and wraps SSR HTML in a new Suspense boundary.
  ssr: STATIC_PREVIEW ? false : true,
  shellComponent: Document,
  wrapInSuspense: STATIC_PREVIEW,
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
    const [pack, brand, payments] = await Promise.all([loadPack(locale), loadBrandPack(locale), STATIC_PREVIEW ? Promise.resolve(false) : getPaymentsEnabled()]);
    registerPack(locale, pack);
    registerBrandPack(locale, brand);
    return { locale, pack, brand, payments };
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
      { rel: "stylesheet", href: editorialCss },
      { rel: "stylesheet", href: v3Css },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  component: Root,
});

function Document({ children }: { children: React.ReactNode }) {
  const locale = useRouterState({ select: state => localeFromLoaderData(state.matches.find(match => match.routeId === "__root__")?.loaderData) });
  const hydrated = useHydrated();
  const htmlLocale = STATIC_PREVIEW && !hydrated ? "tr" : locale;
  return (
    <html lang={localeMeta(htmlLocale).html} className="antialiased" data-theme="pine">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Root() {
  const data = Route.useLoaderData();
  registerPack(data.locale, data.pack);
  registerBrandPack(data.locale, data.brand);
  // SPA prerendering forces the root route to SSR even when ssr:false is set.
  // An explicit ClientOnly body and matching Suspense shell prevent serialized
  // Turkish shell content from being hydrated against a different locale match.
  const content = <ContentLocale.Provider value={data.locale}><ThemeRoot><SiteShell><Outlet /></SiteShell></ThemeRoot></ContentLocale.Provider>;
  return STATIC_PREVIEW ? <ClientOnly>{content}</ClientOnly> : content;
}
