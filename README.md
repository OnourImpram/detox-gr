# detoks.gr

Gümülcine'deki (Komotini) aktar dükkânı için çok dilli (20 dil) e-ticaret vitrini. Taha Hüseyinoğlu'nun ürünleri, Taha'nın hazırladığı paketler.

**Durum:** geliştirme. Ödeme (Shopify) ve alan adı henüz bağlı değil; yayına çıkmadı.

## Teknoloji

TanStack Start + Vite 8 + React 19 + Tailwind v4. Vitrin verisi `src/data/catalog-vitrin.json` (üretilir: `npm run katalog`). Arayüz metinleri 20 dilde: `src/lib/i18n-messages.ts` (TR/EN kaynak) → `src/lib/i18n-gen/<dil>.ts` (üretilir: `npm run i18n`) → `src/lib/i18n-ui.ts` (elle düzeltme katmanı, en üstte).

## Çalıştırma

```sh
npm ci
cp .env.example .env     # değerleri doldurmadan da yerelde çalışır
npm run dev              # http://localhost:8080
npm test && npm run typecheck && npm run lint
```

`.env` repoya girmez. Gerçek anahtarlar (Shopify, Stripe) yalnız ortam değişkeni olarak verilir.

## Ödeme

`SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN` doluysa ödeme Shopify hosted checkout'a gider; boşsa geçici Stripe; ikisi de yoksa "ödeme bağlı değil" durumu gösterilir. Shopify açılınca: `.env` (3 değişken) → `python scripts/shopify-varyant-esle.py` (SKU → variant) → test siparişi → Stripe kodunu sök.

## Tasarım ilkeleri (bağlayıcı)

- Syne + Figtree (özbarındırılan; Yunanca için Noto Sans alt kümeleri), ceviz lake + bakır/altın, tam kare natürmort.
- Sağlık iddiası, abartı, aciliyet baskısı ve uydurma veri yok. Boş alan gizlenir.
- Görsel dürüstlük: yalnız Taha'nın fotoğrafı "gerçek ürün" sayılır; diğer kareler "Temsili görsel" etiketi taşır. Dosya adı içerik değildir; altyazı yazmadan önce görsele bak.
- TR metinde Gümülcine/Rodop, EN'de Komotini/Rhodope.

## Bekleyenler

| Konu | Kimde |
|---|---|
| Ürün formu + fotoğraflar + sorular | Taha (`docs/Taha-Mesaj.md`, `docs/Taha-Urun-Formu.csv`) |
| Shopify mağazası + Payments, alan adı, iş e-postası, `SITE_ORIGINS` | Sahibi |
| `/yasal` metinleri (6 satır) | Danışman |

## Belgeler

`docs/Detoks_gr_Marka_Anlatisi.md` marka anlatısı, `docs/Detoks_gr_Nihai.md` nihai tasarım kararları, `docs/Red-Team-2026-09-22.md` bulgu listesi, `GROK-AGENTS.md` ajan notları.

## Geçmiş

Bu depo, yerel geliştirme geçmişinin temiz bir anlık görüntüsüdür (tek commit). Orijinal geçmişte, sökülmüş bir üçüncü taraf iskeletinden kalma bir önizleme istemci sırrı bulunduğundan geçmiş yayınlanmadı.
