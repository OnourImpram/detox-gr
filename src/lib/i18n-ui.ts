import type { Locale } from "./i18n-locales";

type Pack = Partial<Record<Locale, string>>;

function u(row: Pack): Pack {
  return row;
}

/** Overlay for keys that need more than TR/EN fill(). */
export const UI: Record<string, Pack> = {
  "home.kicker": u({
    tr: "Rodop’ta kök salan özen",
    el: "Φροντίδα ριζωμένη στη Ροδόπη",
    en: "Care rooted in Rhodope",
    de: "Sorgfalt, verwurzelt in den Rhodopen",
    fr: "Un soin enraciné dans le Rhodope",
  }),
  "home.lineA": u({
    tr: "Bu aktarın arkasında, bir insanın",
    el: "Πίσω από αυτό το μαγαζί, η",
    en: "Behind this shop, a person’s",
    de: "Hinter diesem Laden steht die",
    fr: "Derrière cette boutique, la",
  }),
  "home.lineEm": u({
    tr: "merakı var.",
    el: "πε­ρι­έρ­γεια ενός αν­θρώ­που.",
    en: "curiosity.",
    de: "Neugier eines Men­schen.",
    fr: "curiosité d’une personne.",
  }),
  "home.lead": u({
    tr: "Rodop’tan özenle sofranıza.",
    el: "Από τη Ροδόπη, με φροντίδα, στο τραπέζι σας.",
    en: "From Rhodope, with care, to your table.",
    de: "Aus den Rhodopen, mit Sorgfalt, an Ihren Tisch.",
    fr: "Des Rhodopes, avec soin, jusqu’à votre table.",
  }),
  "product.confirmPrice": u({
    tr: "Gümülcine’den, sizin masanıza.",
    el: "Από την Κομοτηνή, στο τραπέζι σας.",
    en: "From Komotini, to your table.",
    de: "Aus Komotini an Ihren Tisch.",
    fr: "De Komotini à votre table.",
  }),
  "story.draft": u({
    tr: "Ben Taha Hüseyinoğlu. Gümülcine’de Detoks’u bir merakla açtım: bedenle çalışırken başlayan, bitkilerle devam eden bir özen. Raflarımı sizin sofranıza açıyorum.",
    el: "Είμαι ο Τάχα Χουσεΐνογλου. Άνοιξα το Detoks στην Κομοτηνή από περιέργεια: μια φροντίδα που ξεκίνησε από το σώμα και συνεχίστηκε με τα φυτά. Ανοίγω τα ράφια μου στο τραπέζι σας.",
    en: "I am Taha Hüseyinoğlu. I opened Detoks in Komotini out of curiosity: care that began with the body and continued with plants. I open my shelves to your table.",
    de: "Ich bin Taha Hüseyinoğlu. Ich habe Detoks in Komotini aus Neugier eröffnet: Sorgfalt, die beim Körper begann und bei den Pflanzen weiterging. Ich öffne meine Regale für Ihren Tisch.",
    fr: "Je suis Taha Hüseyinoğlu. J’ai ouvert Detoks à Komotini par curiosité : un soin né du corps, poursuivi avec les plantes. J’ouvre mes rayons à votre table.",
  }),
  "banner.preview": u({
    tr: "Önizleme kataloğu · Gümülcine · Instagram @detoks_taha",
    el: "Κατάλογος προεπισκόπησης · Κομοτηνή · Instagram @detoks_taha",
    en: "Preview catalogue · Komotini · Instagram @detoks_taha",
    de: "Vorschaukatalog · Komotini · Instagram @detoks_taha",
    fr: "Catalogue d’aperçu · Komotini · Instagram @detoks_taha",
  }),
  "story.lineA": u({
    tr: "Bazı hikâyeler bir kapıyla başlamaz.",
    el: "Κάποιες ιστορίες δεν αρχίζουν από μια πόρτα.",
    en: "Some stories do not start with a door.",
    de: "Manche Ge­schich­ten beginnen nicht mit einer Tür.",
    fr: "Certaines histoires ne com­men­cent pas par une porte.",
  }),
  "story.lineEm": u({
    tr: "Merakla başlar.",
    el: "Αρχίζουν από την πε­ρι­έρ­γεια.",
    en: "They start with curiosity.",
    de: "Sie beginnen mit Neugier.",
    fr: "Elles com­men­cent par la curiosité.",
  }),
  "shop.title": u({
    tr: "Mağaza",
    el: "Κατάστημα",
    en: "Shop",
    de: "Laden",
    fr: "Boutique",
  }),
  "shop.fullHint": u({
    tr: "Koleksiyonlara göz atın. Her rafta Taha’nın seçkisi.",
    el: "Δείτε τις συλλογές. Σε κάθε ράφι, η επιλογή του Τάχα.",
    en: "Browse the collections. Taha’s selection on every shelf.",
    de: "Sehen Sie die Kollektionen. Tahas Auswahl in jedem Regal.",
    fr: "Parcourez les collections. La sélection de Taha sur chaque étagère.",
  }),
  "product.listAdd": u({
    tr: "Sepete ekle",
    el: "Προσθήκη στο καλάθι",
    en: "Add to cart",
    de: "In den Warenkorb",
    fr: "Ajouter au panier",
  }),
  "product.ask": u({
    tr: "Instagram’dan sorun",
    el: "Ρωτήστε στο Instagram",
    en: "Ask on Instagram",
    de: "Auf Instagram fragen",
    fr: "Demander sur Instagram",
  }),
  "nav.shop": u({
    tr: "Mağaza",
    el: "Κατάστημα",
    en: "Shop",
    de: "Laden",
    fr: "Boutique",
  }),
  "nav.story": u({
    tr: "Hikâye",
    el: "Ιστορία",
    en: "Story",
    de: "Geschichte",
    fr: "Histoire",
  }),
  "nav.contact": u({
    tr: "İletişim",
    el: "Επικοινωνία",
    en: "Contact",
    de: "Kontakt",
    fr: "Contact",
  }),
};
