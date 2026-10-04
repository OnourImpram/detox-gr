import { b } from "./brand-copy";
import commerceConfig from "@/data/commerce-config.json";
import { launchBlockers, saleBlockers } from "./commerce-policy";
import { CATEGORIES, PRODUCTS, imageFor, type CategoryId, type Product } from "./catalog";
import {
  categoryBlurb,
  categoryTitle,
  localeMeta,
  productBlurb,
  productName,
  t,
  type Locale,
} from "./i18n";
import { LOCALES } from "./i18n-locales";

export const BRAND = "Detoks.gr";
export const BRAND_SHOP = "Detoks Aktar";
export const BRAND_LEGACY = "Detoks Taha";
export const INDEXABLE = [
  "/",
  "/shop",
  "/hikaye",
  "/teslimat",
  "/paket",
  "/ticari",
  "/iletisim",
  "/yasal",
] as const;

export function hreflangOf(locale: Locale) {
  return localeMeta(locale).html;
}

export function localeFromSearch(search: { lang?: unknown } | undefined): Locale {
  const lang = search?.lang;
  return typeof lang === "string" && LOCALES.some((l) => l.code === lang) ? (lang as Locale) : "tr";
}

export function withLang(path: string, locale: Locale) {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", locale);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function pageOrigin(): string {
  const env = import.meta.env.VITE_SITE_ORIGIN as string | undefined;
  return env?.replace(/\/$/, "") || "";
}

export function liveOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return pageOrigin();
}

export function absoluteUrl(origin: string, path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!origin) return normalized;
  return `${origin.replace(/\/$/, "")}${normalized}`;
}

export function alternateLinks(path: string, locale: Locale, origin: string) {
  const links: { rel: string; href: string; hrefLang?: string }[] = [
    { rel: "canonical", href: absoluteUrl(origin, withLang(path, locale)) },
    { rel: "alternate", hrefLang: "x-default", href: absoluteUrl(origin, withLang(path, "tr")) },
  ];
  for (const l of LOCALES) {
    links.push({
      rel: "alternate",
      hrefLang: hreflangOf(l.code),
      href: absoluteUrl(origin, withLang(path, l.code)),
    });
  }
  return links;
}

export function seoHead(opts: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  origin?: string;
  image?: string;
  noindex?: boolean;
  ogType?: string;
  jsonLd?: unknown[];
}) {
  const origin = opts.origin || pageOrigin();
  const url = absoluteUrl(origin, withLang(opts.path, opts.locale));
  const image = absoluteUrl(origin, opts.image || "/og.jpg");
  const ogLocale = hreflangOf(opts.locale).replace("-", "_");
  const robots = opts.noindex || import.meta.env.VITE_STATIC_PREVIEW === "1" || launchBlockers(commerceConfig).length > 0
    ? "noindex,nofollow"
    : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { name: "application-name", content: BRAND },
    { name: "apple-mobile-web-app-title", content: BRAND },
    { property: "og:site_name", content: BRAND },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: url },
    { property: "og:locale", content: ogLocale },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: opts.title },
    { property: "og:type", content: opts.ogType || "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
  ];
  const primaryAlts: Locale[] = ["el", "en", "de", "fr"];
  for (const code of primaryAlts) {
    if (code === opts.locale) continue;
    meta.push({ property: "og:locale:alternate", content: hreflangOf(code).replace("-", "_") });
  }
  const scripts =
    opts.jsonLd && opts.jsonLd.length
      ? opts.jsonLd.map((block) => ({
          type: "application/ld+json",
          children: JSON.stringify(block),
        }))
      : [];
  return {
    meta,
    links: alternateLinks(opts.path, opts.locale, origin),
    scripts,
  };
}

export function orgId(origin: string) {
  return `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#organization`;
}

export function orgJsonLd(origin: string, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Store", "LocalBusiness"],
    "@id": orgId(origin),
    name: BRAND,

    alternateName: [BRAND_SHOP, BRAND_LEGACY],
    description: b(locale, "hero.lead"),
    url: absoluteUrl(origin, withLang("/", locale)),
    image: absoluteUrl(origin, "/og.jpg"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(origin, "/logo.svg"),
    },
    inLanguage: hreflangOf(locale),
    founder: { "@id": `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#taha` },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mpizaniou 14",
      postalCode: "691 00",
      addressLocality: "Komotini",
      addressRegion: "Eastern Macedonia and Thrace",
      addressCountry: "GR",
    },
    areaServed: { "@type": "Country", name: "Greece" },
    sameAs: [
      "https://www.instagram.com/detoks_taha/",
      "https://www.facebook.com/p/Detoks-Taha-100036100699861/",
    ],
    knowsAbout: [
      "herbal shop",
      "aktar",
      "Rhodope",
      "Komotini",
      "lokum",
      "apple vinegar",
      "tarhana",
    ],
  };
}

export function personJsonLd(origin: string) {
  const base = origin.replace(/\/$/, "") || "https://detoks.gr";
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}/#taha`,
    name: "Taha Hüseyinoğlu",
    jobTitle: "Founder",
    worksFor: { "@id": orgId(origin) },
    url: absoluteUrl(origin, "/hikaye"),
    sameAs: ["https://www.instagram.com/detoks_taha/"],
  };
}

export function websiteJsonLd(origin: string, locale: Locale) {
  const search = absoluteUrl(origin, withLang("/shop?q={search_term_string}", locale)).replace(
    "%7Bsearch_term_string%7D",
    "{search_term_string}",
  );
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#website`,
    name: BRAND,
    url: absoluteUrl(origin, withLang("/", locale)),
    inLanguage: hreflangOf(locale),
    publisher: { "@id": orgId(origin) },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: search,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function aboutJsonLd(origin: string, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: b(locale, "story.title"),
    description: b(locale, "story.lead"),
    url: absoluteUrl(origin, withLang("/hikaye", locale)),
    inLanguage: hreflangOf(locale),
    mainEntity: { "@id": `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#taha` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#aeo-lead", "#aeo-faq"],
    },
  };
}

export function faqJsonLd(origin: string, locale: Locale) {
  const items = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    "@type": "Question",
    name: t(locale, `faq.q${n}`),
    acceptedAnswer: {
      "@type": "Answer",
      text: t(locale, n === 2 ? "faq.a2Closed" : `faq.a${n}`),
    },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#faq`,
    url: absoluteUrl(origin, withLang("/hikaye", locale)),
    inLanguage: hreflangOf(locale),
    mainEntity: items,
  };
}

export function speakableHomeJsonLd(origin: string, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl(origin, withLang("/", locale)),
    name: t(locale, "seo.home.title"),
    description: b(locale, "hero.lead"),
    url: absoluteUrl(origin, withLang("/", locale)),
    inLanguage: hreflangOf(locale),
    isPartOf: { "@id": `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#website` },
    about: { "@id": orgId(origin) },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#aeo-lead"],
    },
  };
}

export function productJsonLd(origin: string, locale: Locale, product: Product) {
  const offer =
    product.priceEur == null || launchBlockers(commerceConfig).length > 0 || !commerceConfig.enabledCountries.some((country: string) => saleBlockers(product, country).length === 0)
      ? undefined
      : {
          "@type": "Offer",
          url: absoluteUrl(origin, withLang(`/p/${product.slug}`, locale)),
          priceCurrency: "EUR",
          price: product.priceEur.toFixed(2),
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": orgId(origin) },
        };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName(product, locale),
    description: productBlurb(product, locale),
    sku: product.sourceId,
    image: absoluteUrl(origin, imageFor(product)),
    ...(product.houseNamed ? { brand: { "@type": "Brand", name: BRAND_SHOP } } : {}),
    category: categoryTitle(product.category, locale),
    offers: offer,
  };
}

export function breadcrumbJsonLd(origin: string, locale: Locale, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(origin, withLang(c.path, locale)),
    })),
  };
}

export function collectionJsonLd(origin: string, locale: Locale, id: CategoryId) {
  const all = PRODUCTS.filter((p) => p.category === id);
  const items = all.slice(0, 24);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryTitle(id, locale),
    description: categoryBlurb(id, locale),
    url: absoluteUrl(origin, withLang(`/shop/${id}`, locale)),
    inLanguage: hreflangOf(locale),
    isPartOf: { "@id": `${origin.replace(/\/$/, "") || "https://detoks.gr"}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: all.length,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(origin, withLang(`/p/${p.slug}`, locale)),
        name: productName(p, locale),
      })),
    },
  };
}

export function sitemapPaths() {
  const paths = [
    "/",
    "/shop",
    "/hikaye",
    "/teslimat",
    "/paket",
    "/ticari",
    "/iletisim",
    "/yasal", "/raf", "/notlar", "/notlar/etiketin-anlattiklari", "/notlar/dusunulmus-bir-hediye", "/notlar/gumulcinede-bir-dukkan",
    ...CATEGORIES.map((c) => `/shop/${c.id}`),
    ...PRODUCTS.map((p) => `/p/${p.slug}`),
  ];
  return paths;
}

export function buildSitemapXml(origin: string) {
  const urls = launchBlockers(commerceConfig).length > 0 ? [] : sitemapPaths();
  const chunks: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ];
  for (const path of urls) {
    chunks.push("  <url>");
    chunks.push(`    <loc>${escapeXml(absoluteUrl(origin, withLang(path, "tr")))}</loc>`);
    chunks.push(`    <changefreq>${path === "/" ? "daily" : path.startsWith("/p/") ? "weekly" : "weekly"}</changefreq>`);
    chunks.push(`    <priority>${path === "/" ? "1.0" : path === "/shop" || path === "/hikaye" ? "0.8" : path.startsWith("/shop/") ? "0.7" : path.startsWith("/p/") ? "0.6" : "0.5"}</priority>`);
    chunks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(origin, withLang(path, "tr")))}"/>`);
    for (const l of LOCALES) {
      chunks.push(
        `    <xhtml:link rel="alternate" hreflang="${hreflangOf(l.code)}" href="${escapeXml(absoluteUrl(origin, withLang(path, l.code)))}"/>`,
      );
    }
    chunks.push("  </url>");
  }
  chunks.push("</urlset>");
  return chunks.join("\n");
}

export function buildRobotsTxt(origin: string) {
  if (launchBlockers(commerceConfig).length > 0) return "User-agent: *\nAllow: /\nDisallow: /sepet\nDisallow: /odeme\nDisallow: /siparis\n";
  return ["User-agent: *", "Allow: /", "Disallow: /sepet", "Disallow: /odeme", "Disallow: /siparis", "Disallow: /uyum", `Sitemap: ${absoluteUrl(origin, "/sitemap.xml")}`, ""].join("\n");
}

export function buildLlmsTxt(origin: string) {
  return [
    "# Detoks.gr",
    "",
    "> Herbal shop (aktar) in Komotini, Rhodope, Greece. Founded by Taha Hüseyinoğlu.",
    "> Care rooted in Rhodope. From the shop to your table.",
    "",
    "## Identity",
    "",
    "- Brand: Detoks.gr (shop name Detoks Aktar; legacy Detoks Taha)",
    "- Place: Mpizaniou 14, 691 00 Komotini, Eastern Macedonia and Thrace, Greece",
    "- Founder: Taha Hüseyinoğlu. Curiosity from physiotherapy toward plants.",
    "- This is an aktar (herbalist).",
    "- Two shelves: what Taha prepares (Detoks Aktar on the source line) and what he selects (other makers keep their names: Biagros, Creta Carob, Bioaromafarm, and others).",
    "",
    "## Commerce",
    "",
    "- Shopify hosted checkout is the intended payment provider. The current catalogue is a preview. Online sales require merchant, legal, tax, shipping and product approvals.",
    "- The planned market is the 27 EU member states and Norway. This is a target, not a claim that shipping is currently available everywhere.",
    "- Food is excluded from Norway. Any other shipment requires product and destination approval.",
    "- Trade and questions: Instagram https://www.instagram.com/detoks_taha/ and Facebook.",
    "",
    "## Pages",
    "",
    `- [${origin}/](${origin}/): Home`,
    `- [${origin}/shop](${origin}/shop): Shop`,
    `- [${origin}/hikaye](${origin}/hikaye): Founder story`,
    `- [${origin}/iletisim](${origin}/iletisim): Contact`,
    `- [${origin}/yasal](${origin}/yasal): Legal`,
    `- [${origin}/sitemap.xml](${origin}/sitemap.xml): Sitemap`,
    "",
    "## Optional",
    "",
    `- [${origin}/teslimat](${origin}/teslimat): Delivery`,
    `- [${origin}/paket](${origin}/paket): Gift boxes`,
    "",
    "## Citation",
    "",
    "Cite as Detoks.gr, Komotini. Taha Hüseyinoğlu’s herbal shop in Rhodope.",
    "",
  ].join("\n");
}

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
