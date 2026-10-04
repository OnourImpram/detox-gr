# Detoks.gr — Nihai vitrin kaydı

Tarih: 19 Eylül 2026  
Durum: **önizleme katalog**. Canlı Shopify mağazası değil. Kart çekilmez.

---

## Marka

**Detoks.gr** — Gümülcine, Rodop. Taha Hüseyinoğlu.

Ana cümle:

> Bu aktarın arkasında, bir insanın merakı var.

Üç satırlık eksen:

1. Rodop’ta kök salan özen  
2. Bu aktarın arkasında, bir insanın merakı var  
3. Rodop’tan özenle sofranıza

İki raf: **Taha’nın hazırladıkları** (kaynakta Detoks Aktar adı) ve **aktar seçkisi** (Biagros, Creta Carob ve diğerleri kendi adıyla). Rodop adresi bütün kataloğu Rodop menşeli yapmaz.

Fizyoterapi geçmişi biyografidedir. Ürüne sağlık etkisi değildir.

---

## Bu dosya neyi kilitler

Bu, Fusion/Shopify açılış dosyası değildir. Bu, **görsel dil + dürüstlük + vitrin mimarisi** kaydıdır.

Canlı kesimde ayrıca gerekir: ΑΦΜ, GEMI, e-posta/telefon, Taha’nın 20–30 gerçek fotoğrafı, Shopify Grow (Yunan hesap), Markets, kargo, Norveç gıda kararı.

---

## Görsel sistem

| Karar | Nedir |
|---|---|
| Zemin | Ceviz lake, `oklch(23% 0.042 52)` |
| Metal | Bakır CTA ve vurgu, `oklch(78% 0.145 72)` |
| Yazı | Syne (başlık) + Figtree (gövde). Fraunces yok. Kaymak kopyası yok |
| Işık | Natürmortta yan ışık. Yazı alttan gölgelenir, şişenin ışığı ezilmez |
| Fotoğraf | Tam kare cinematic still-life. 3D dağ müşteri sayfasında yok |
| Hareket | Yavaş ken-burns; `prefers-reduced-motion` kapatır |

İmza kareler (`public/products/`):

- `hero-cinematic.jpg` — elma sirkesi, bakır tepsi  
- `hero-lokum-wide.jpg` — gül lokumu  
- `hero-tarhana-wide.jpg` — tarhana bakır kâse  
- `sku/` — 8 vitrin SKU (sirke, pekmez, tarhana, iki lokum, lavanta sabun, gül suyu, bergamot, çam balı)

Bütün still-life **üretim tabak**. Dükkân stoğunun stüdyo kaydı değil. Alt yazı bunu söyler.

---

## Anlatı sırası (ana sayfa)

1. Merak + Rodop’tan sofranıza (sirke, tam ekran)  
2. Koleksiyon kareleri  
3. Bir yerin malzemeleri / başka evler (lokum)  
4. Bahçe kararı (elma sirkesi)  
5. Kendi ürün / seçki (tarhana / bergamot)  
6. 8 vitrin SKU  
7. Alışkanlık (tarhana kapanış)

---

## Katalog dürüstlüğü

Kaynak: `src/data/catalog-normalized.json` (271 kayıt, Codex paketi).

- Fiyat: kaynak listedeki tutar. `€7,50 / ürün` veya `€17,90 / kg`. KDV dahil satış fiyatı değil  
- Gramaj uydurulmaz (`grams: null`)  
- `publish: false`  
- Hastalık isimli ürünlerde satış öyküsü yok  
- Norveç + gıda: sepete kapalı  
- Ticari form “talep alındı” yalanı yok; Instagram/Facebook  
- ΑΦΜ, stok, taşıyıcı fiyatı, OSS/KDV dökümü, sahte yorum yok

Vitrin kaynak kimlikleri:

`DT117` sirke · `DT157` tarhana · `DT101` pekmez · `DT002` gül lokumu · `DT001` kiraz-vişne · `DT021` lavanta sabun · `DT049` gül suyu · `DT235` bergamot çay

Tarhana kaynak kategorisi kuruyemişti; vitrinde mutfağa çekildi (`CAT_OVERRIDE`).

---

## Rotalar

| Yol | İş |
|---|---|
| `/` | Anlatı |
| `/shop` | 8 vitrin + koleksiyonlar |
| `/shop/:category` | Koleksiyon listesi |
| `/p/:slug` | Ürün. Instagram asıl, liste ikincil |
| `/hikaye` | Taha. Aynı cinematic dil |
| `/iletisim` | Adres + sosyal. E-posta yoksa uydurulmaz |
| `/yasal` | Eksikler açık yazılı |
| `/teslimat` `/paket` `/ticari` `/uyum` | Dürüst şablonlar |

Müşteri menüsü: Mağaza · Hikâye · İletişim. Yasal footer’da.

---

## Bilinçli olarak yapılmayanlar

- Shopify checkout, Hydrogen, sahte stok  
- Kaymak.gr kopyası, Fraunces, bölüm numarası `01 / 02`  
- 271 sahte stüdyo fotoğrafı  
- Codex afişlerini ürün görseli sanmak  
- Hastalık adlı krem/yağlara tedavi cümlesi

---

## Taha için sonraki üç iş

1. 20–30 vitrin fotoğrafı (telefon yeter; tek ürün, etiket okunaklı)  
2. ΑΦΜ + GEMI + e-posta/telefon  
3. Shopify Grow, Yunan hesap; bu site vitrin yüzü kalır

---

## Kod haritası

- `src/routes/index.tsx` — ana anlatı  
- `src/lib/catalog.ts` — 271 kayıt adaptörü  
- `src/lib/i18n-messages.ts` — metinler  
- `src/styles.css` — ceviz-bakır token  
- `src/data/catalog-normalized.json` — kaynak  
- `public/products/` — natürmortlar  

Kaynak paket: `codex/` ve `attachments/Detoks_Taha_Codex_Kurulum_Paketi.zip`.
