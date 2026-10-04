export const SOCIAL = {
  instagram: {
    href: "https://www.instagram.com/detoks_taha/",
    handle: "@detoks_taha",
    label: "Instagram",
  },
  facebook: {
    href: "https://www.facebook.com/p/Detoks-Taha-100036100699861/",
    handle: "Detoks Taha",
    label: "Facebook",
  },
} as const;

export const SHOP_FACTS = {
  brand: "Detoks.gr",
  owner: "Taha Hüseyinoğlu",
  shop: "Detoks Aktar",
  // Doğrulanmış adres (Google Haritalar, 2026-09-21): Mpizaniou 14, 691 00 Komotini. Yunanca biçim ELOT geri-çevrimi (Μπ=Mp).
  streetTr: "Mpizaniou 14",
  streetEl: "Μπιζανίου 14",
  streetEn: "Mpizaniou 14",
  cityTr: "Gümülcine",
  cityEl: "Κομοτηνή",
  cityEn: "Komotini",
  country: "Yunanistan",
} as const;

export function shopCity(locale: string) {
  if (locale === "tr") return SHOP_FACTS.cityTr;
  if (locale === "el") return SHOP_FACTS.cityEl;
  return SHOP_FACTS.cityEn;
}

export function shopStreet(locale: string) {
  if (locale === "tr") return SHOP_FACTS.streetTr;
  if (locale === "el") return SHOP_FACTS.streetEl;
  return SHOP_FACTS.streetEn;
}
