// Doğrulanmış dükkân olguları — tek kaynak.
// Kaynak: Google Haritalar ("Detoks", Mpizaniou 14, Komotini) + Instagram @detoks_taha + Facebook "Detoks Taha".
// Doğrulama tarihi: 2026-09-21.
// Pazar saati harita kaydında görünmediği için bilinçli olarak YAZILMIYOR.

export const SHOP_PHONE_DISPLAY = "+30 694 582 7275";
export const SHOP_PHONE_TEL = "+306945827275";

// [UNVERIFIED] wa.me kısa bağlantı kalıbı — numara doğrulanmış, bağlantı biçimi standart
export const SHOP_WHATSAPP = "https://wa.me/306945827275";

// [UNVERIFIED] Google Haritalar sorgu bağlantısı kalıbı — adres doğrulanmış (Mpizaniou 14, 691 00 Komotini, Greece)
export const SHOP_MAPS =
  "https://www.google.com/maps/search/?api=1&query=Mpizaniou%2014%2C%20691%2000%20Komotini%2C%20Greece";

/**
 * Çalışma saatleri.
 * days: 2024-01-01 Pazartesi'ye denk gelir; gün numarası ayın günü olarak kullanılır
 * (1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 6=Cmt). Gün adları ShopFacts içinde
 * Intl.DateTimeFormat ile dile göre üretilir — i18n anahtarı gerekmez.
 */
export const SHOP_HOURS = [
  { days: [1, 3, 5, 6], slots: ["09:30–14:30"] },
  { days: [2, 4], slots: ["09:30–14:30", "18:00–21:00"] },
] as const;
