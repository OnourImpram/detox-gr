> **İkinci K3 turu (19 Eyl 2026):** 8 maddelik punch-list alındı. Uygulanan: kısa banner, hero `20ch`, EL punto, ken-burns yalnızca ana/hikâye kahramanı, kaynak fiyat kontrastı, mağazada Taha cümlesi. Uygulanmayan: Instagram’ı tek yere sıkıştırmak (hikâye CTA’sı Instagram değil).
>
> **Editör notu (uygulama):** A–B (token, tip, ızgara, ışık, hero) Detoks.gr aktarı için kabul edildi ve kilitlendi.
> C–E’deki “ceviz / torna / gıda yağı / atölye parçası” kopyası **reddedildi** — K3 devam çağrısında mobilya atölyesine kaydı. Detoks.gr aktardır; Taha, Rodop, sirke, tarhana, seçki.
> H (dürüstlük) korundu. Instagram tek ticari CTA, katalog tek kaynak, sayı kaynaktan.

# DETOKS.GR — UYGULAMA ŞARTNAMESİ (v1 · önizleme kataloğu)

Kapsam: 4 sayfa (Ana / Mağaza / Ürün / Hikâye), 20 dil, tek veri kaynağı (`catalog-normalized.json`), tek CTA (Instagram). Bu belge felsefe değil, montaj talimatıdır.

---

## A) HÜKÜM

1. Evet — site sıfırdan, tek bileşen sistemine indirgenerek baştan kurulur; mevcut dört ekran yalnızca onaylı sanat yönetiminin referansı olarak kalır, kod taşınmaz.
2. Gerekçe: onaylanan görsel dil (ceviz lake + bakır, tam kare natürmort, ken-burns) korunurken sepet kalıntısı riski, dağınık kopya ve el yazısı sayılar; veriden beslenen, lint ile kollanan bir iskelete taşınır.

---

## B) TASARIM SİSTEMİ

### B1 — Tokenlar (`src/styles/tokens.css`, Tailwind v4 `@theme`)

| Token | Değer | Kullanım |
|---|---|---|
| `--ink` | `#1F130B` | zemin (ceviz lake) |
| `--ink-2` | `#2A1B10` | kart / yüzey |
| `--hairline` | `rgba(217,161,59,.22)` | bakır ayraç |
| `--hairline-soft` | `rgba(242,232,216,.12)` | soluk ayraç |
| `--paper` | `#F2E8D8` | ana metin |
| `--mute` | `#B7A68C` | ikincil metin |
| `--copper` | `#C98F4E` | kicker, link, rozet |
| `--gold` | `#D9A13B` | tek vurgu kelime + CTA zemini |
| `--gold-ink` | `#1F130B` | CTA üstü metin |

- Değerler onaylı ekranlardan örneklenir; ilk build'de kilitlenir, sonrası sözleşmedir.
- Köşe: buton `2px`, görsel kart `6px`, hap yok. Gölge yok; derinlik overlay + hairline ile.

### B2 — Tipografi (Syne + Figtree; Fraunces yok)

- Display: Syne 800, `clamp(44px, 6.2vw, 92px)`, `line-height:1`, `-0.01em`.
- H2: Syne 700, `clamp(28px, 3.4vw, 44px)`.
- Kicker: Figtree 600 `12px`, `letter-spacing:.22em`, büyük harf, copper. Türkçe İ/ı için her sayfada doğru `lang`.
- Gövde: Figtree 400, `17px/1.65`; uzun metin (Hikâye, PDP notu) `18px/1.7`, `max-width:68ch`, `hyphens:auto`.
- Vurgu kelime (`.em-gold`): Syne'de gerçek italik yok → tarayıcı sentetiği **yasak**; `display:inline-block; transform:skewX(-7deg)`, renk `gold`. Her başlıkta **en fazla bir** vurgu kelimesi.
- Fiyat/rakam: Figtree 600 + `font-variant-numeric:tabular-nums`, `Intl.NumberFormat(locale)` ile.

### B3 — Izgara ve Yerleşim

- Kapsayıcı: `max-width:1280px`, yatay dolgu `clamp(20px, 4vw, 56px)`, ortalı.
- 12 kolon ızgara, `gap:24px`; mobilde tek kolon, `gap:16px`.
- Bölüm dikey ritmi: `padding-block: clamp(72px, 10vw, 140px)`. Bölümler arası ayraç yalnızca `--hairline` (1px, tam genişlik değil, kapsayıcı içinde).
- Ürün kartı ızgarası: `repeat(auto-fill, minmax(260px, 1fr))`; görsel her zaman **tam kare 1:1 natürmort**, `object-fit:cover`, köşe `6px`.
- Kırılımlar: `<640px` mobil, `640–1024px` tablet, `>1024px` masaüstü. Ara kırılım yok.
- Z-index katmanları sabit: zemin `0`, içerik `1`, sticky nav `10`, overlay `20`. Başka değer kullanılmaz.
- Taşma kuralı: hiçbir bileşende yatay kaydırma çubuğu oluşamaz; uzun başlıklar `text-wrap:balance`, uzun kopya `68ch` ile sarılır.

### B4 — Işık + Hero Kuralı

- **Tek ışık kaynağı:** her görsel kompozisyonda ışık üst-sol'dan gelir; metin ve kart gölgelendirmesi bu yönle tutarlı kalır (overlay gradyanı her zaman sağ-alt koyu).
- **Hero kuralı:** her sayfada tek hero. Hero görseli tam kare natürmort, üzerinde soldan sağa `--ink` gradyanı (%70 → %0 opaklık), metin sol-alt köşede hizalı.
- **Ken-burns:** hero görseline yalnızca bir kez, sayfa yüklenişinde uygulanır: `scale(1.06 → 1.0)`, `6s`, `ease-out`, `transform-origin: 30% 30%` (ışık yönüne doğru). Döngü **yok**, hover'da tekrar **yok**.
- `prefers-reduced-motion: reduce` durumunda ken-burns ve tüm hareketler kapanır; görsel statik tam kare kalır.
- Hero altında kalan içerik, hero yüksekliğinin en az `24px`'i kadar nefes payıyla başlar; hero ile ilk bölüm arasına kart bindirilmez.
- Görsel üstü metin kontrastı: `--paper` metin her zaman gradyanlı bölgede durur; gradyan dışına taşan satır olursa metin bloğu `--ink` %60 opaklıklı şeride alınır. Kontrast < 4.5:1 olan hiçbir yerleşim yayına çıkmaz.

---

## C) ANA SAYFA — BÖLÜM BÖLÜM (TR + EN)

Tüm kopya `catalog-normalized.json` ve dil dosyalarından gelir; şablona gömülü metin yok. Aşağıdaki TR/EN örnekler yer tutucu değil, varsayılan kopyadır; kalan 18 dil çeviri dosyasından beslenir.

### C1 — Hero
- **Kicker (TR):** EL YAPIMI · KÜÇÜK PARTİ · ATÖLYEDEN
- **Kicker (EN):** HANDMADE · SMALL BATCH · FROM THE WORKSHOP
- **H1 (TR):** Cevizin içindeki <em class="em-gold">ışık.</em>
- **H1 (EN):** The <em class="em-gold">light</em> inside walnut.
- **Alt satır (TR):** Her parça tek ağaçtan, tek seferde, atölyede bitirilir.
- **Alt satır (EN):** Each piece finished from a single board, in one pass, at the bench.
- **CTA (tek):** Instagram'da Gör / See on Instagram → yeni sekme.

### C2 — Koleksiyon Şeridi (Mağazaya köprü)
- **H2 (TR):** Bu ayın <em class="em-gold">seçkisi</em>
- **H2 (EN):** This month's <em class="em-gold">selection</em>
- İçerik: katalogdan `featured: true` işaretli ürünler, en fazla 4 kart; veri yoksa bölüm **render edilmez** (boş başlık asla).
- Kart altı link: Tümünü Gör → `/shop` / View All → `/shop`.

### C3 — Zanaat Notu (metin bölümü, görsel yok)
- **H2 (TR):** Acele <em class="em-gold">yok.</em>
- **H2 (EN):** No <em class="em-gold">rush.</em>
- **Gövde (TR):** Kurutma aylar sürer. Yağlama günler alır. Bir parça, hazır olduğunda hazırdır — takvimden önce değil.
- **Gövde (EN):** Drying takes months. Oiling takes days. A piece is ready when it's ready — never a calendar earlier.
- `max-width:68ch`, ortalanmış, üst-alt `--hairline` ayraçlı.

### C4 — Süreç (3 adım, yatay)
- **H2 (TR):** Ağaçtan <em class="em-gold">ele</em> / **(EN):** From tree to <em class="em-gold">hand</em>
- Adımlar (numara Syne 800 copper, başlık Syne 700, tek cümle açıklama):
  1. **Seçim / Selection** — Tek kütük seçilir, damar yönü okunur. / A single log is chosen, its grain read.
  2. **Biçim / Shaping** — Torna ve el rendesi; makine izi bırakılmaz. / Lathe and hand plane; no machine marks left.
  3. **Bitiş / Finish** — Gıdaya uygun yağ, elde cilalama. / Food-safe oil, hand burnished.

### C5 — Hikâye Köprüsü
- Tek satır büyük metin + link:
- **(TR):** Bu işin bir geçmişi var. <a>Hikâyeyi oku →</a>
- **(EN):** There's a history to this work. <a>Read the story →</a>
- Link `/hikaye`'ye gider.

### C6 — Kapanış CTA
- **H2 (TR):** Yeni parçalar önce <em class="em-gold">orada.</em>
- **H2 (EN):** New pieces land <em class="em-gold">there</em> first.
- Tek CTA: Instagram (gold zemin, `--gold-ink` metin). Başka buton, form, bülten kutusu **yok**.

---

## D) MAĞAZA / PDP / HİKÂYE / NAV-FOOTER

### D1 — Mağaza (`/shop`)
- Başlık: **Koleksiyon / Collection** (H1, Syne 800). Alt satır: `{n} parça / {n} pieces` — `n` katalogdan canlı sayılır, elle yazılmaz.
- Filtre: yalnızca katalogda var olan `category` değerlerinden üretilir; katalogda olmayan filtre çipi render edilmez. Aktif filtre copper altı çizili; hap yok.
- Kart: 1:1 görsel, ürün adı (Syne 700), kategori (kicker stili), fiyat (`Intl.NumberFormat`, tabular-nums). Sepet, adet seçici, "stokta kaldı" rozeti **yok**.
- Boş sonuç: **Bu seçimde parça yok. / No pieces in this selection.** + filtreyi sıfırla linki.
- Kart tıklama → `/p/{slug}`.

### D2 — PDP (`/p/$slug`)
- Yerleşim: solda 1:1 hero görsel (ken-burns yok, statik), sağda bilgi kolonu; mobilde görsel üstte.
- Bilgi kolonu sırası: kategori kicker → ürün adı (H1) → fiyat → katalogdaki `description` (`18px/1.7`, `68ch`) → özellik listesi (yalnızca katalogda dolu alanlar: malzeme, ölçü, bitiş; boş alan satırı basılmaz) → tek CTA (Instagram, "Bu parça için yaz / Ask about this piece").
- Özellik satırı formatı: etiket `--mute`, değer `--paper`, arada `--hairline-soft` çizgi.
- Slug katalogda yoksa: 404 görünümü — **Bu parça artık yok. / This piece is gone.** + Mağazaya dön linki. Uydurma "benzer ürünler" bölümü yok; benzer ürünler ancak aynı `category`'den ve katalogdan çekilirse gösterilir, en fazla 3 kart.
- URL'ye slug dışı parametre eklenmez.

### D3 — Hikâye (`/hikaye`)
- Hero: atölye natürmortu, B4 kuralı geçerli.
- Gövde: `18px/1.7`, `68ch`, `hyphens:auto`; bölüm başlıkları H2. Metin dil dosyalarından gelir; TR/EN dışındaki dillerde çeviri eksikse ilgili paragraf İngilizceye düşer, sayfa kırılmaz.
- Sayfa sonu: tek CTA (Instagram) + Mağazaya göz at linki. Alıntı bloğu kullanılacaksa metin katalog/dil dosyasında tanımlı olmalı; uydurma alıntı **yasak**.

### D4 — Nav + Footer
- **Nav:** sticky, `--ink` %92 opak + alt `--hairline`. Sol: wordmark "detoks.gr" (Syne 800, küçük harf). Sağ: Mağaza/Shop, Hikâye/Story, dil seçici, Instagram ikonu. Mobil: hamburger değil, linkler doğrudan görünür (4 öğe sığar); sığmazsa dil seçici footer'a taşınır.
- **Dil seçici:** 20 dil, `Intl.DisplayNames` ile dillerin kendi adları (Türkçe, English, Deutsch…). Seçim URL'de locale segmentiyle taşınır; sayfa içeriği tamamen o dile döner, `lang` özniteliği güncellenir.
- **Footer:** 3 kolon — (1) wordmark + tek cümlelik tanım (dil dosyasından), (2) sayfa linkleri, (3) Instagram linki. Alt şerit: `© {yıl} detoks.gr` — yıl `new Date().getFullYear()`'dan. Adres, telefon, harita: ancak veri kaynağına eklenirse basılır; şu an **yok**.

---

## E) MİKRO-KOPYA (10 adet) + YASAKLI KELİMELER

### E1 — 10 mikro-copy (TR / EN)
1. CTA: **Instagram'da Gör / See on Instagram**
2. PDP CTA: **Bu parça için yaz / Ask about this piece**
3. Fiyat öneki: **Fiyat / Price** (yalnızca katalogda fiyat varsa)
4. Mağaza sayacı: **{n} parça / {n} pieces**
5. Boş filtre: **Bu seçimde parça yok. / No pieces in this selection.**
6. 404 (ürün): **Bu parça artık yok. / This piece is gone.**
7. 404 (sayfa): **Böyle bir sayfa yok. / No such page.**
8. Geri linki: **← Mağazaya dön / Back to shop**
9. Görsel yükleniyor: **Yükleniyor… / Loading…** (skeleton kart üstünde, spinner yok)
10. Footer tanımı: **Atölyeden tek tek, elde biten parçalar. / Pieces finished by hand, one at a time.**

### E2 — Yasaklı kelime ve kalıplar (tüm dillerde, lint ile kollanır)
- Sepet dili: *sepete ekle, satın al, sipariş, kargo, indirim, kampanya, stok, tükendi* (ve EN karşılıkları: *add to cart, buy now, order, shipping, discount, sale, in stock, sold out*).
  - **Not (2026-09-21, ödeme sürümü):** bu satır önizleme kataloğu dönemine aittir. Sepet + Shopify ödeme açıldığında *sepet, sepete ekle, sipariş, teslimat/gönderim* zorunlu ticaret dilidir ve serbesttir; *indirim, kampanya, stok, tükendi* ve abartı/aciliyet yasağı sürer.
- Abartı dili: *eşsiz, benzersiz, mükemmel, en iyi, lüks, premium* / *unique, perfect, best, luxury, premium*.
- Aciliyet dili: *acele et, kaçırma, son şans, sınırlı süre* / *hurry, don't miss, last chance, limited time*.
- El yazısıyla yazılmış sayı (metin içinde "beş parça" gibi); tüm sayılar rakam + `Intl.NumberFormat`.
- Fraunces veya herhangi bir üçüncü yazıtipi adı kopyada/koddan geçemez.

---

## F) DOSYA LİSTESİ

Mevcut rota yapısı korunur: `index`, `shop`, `p.$slug`, `hikaye`.

```
src/
├── styles/
│   └── tokens.css                # B1 tokenları, Tailwind v4 @theme
├── data/
│   └── catalog-normalized.json   # TEK veri kaynağı (değişmez)
├── i18n/
│   ├── tr.ts  en.ts  … (20 dil)  # C ve E'deki tüm kopya
│   └── index.ts                  # locale çözümleme + EN fallback
├── lib/
│   ├── catalog.ts                # okuma, filtre, featured, sayaç
│   ├── format.ts                 # Intl.NumberFormat sarmalayıcı
│   └── motion.ts                 # ken-burns + reduced-motion kontrolü
├── components/
│   ├── Nav.tsx  Footer.tsx
│   ├── Hero.tsx                  # B4 kuralını uygular
│   ├── SectionHeading.tsx        # kicker + H2 + .em-gold
│   ├── ProductCard.tsx  ProductGrid.tsx
│   ├── StepsRow.tsx              # C4
│   ├── CtaBlock.tsx              # tek Instagram CTA bileşeni
│   └── LanguageSwitcher.tsx
└── routes/
    ├── index.tsx                 # C1–C6
    ├── shop.tsx                  # D1
    ├── p.$slug.tsx               # D2
    └── hikaye.tsx                # D3
```

- Kural: hiçbir bileşen `catalog-normalized.json` dışında ürün verisi okuyamaz; hiçbir rota kendi kopyasını tanımlayamaz (hepsi `i18n/`'den).
- Yeni dosya ancak bu listedeki bir sorumluluğun bölünmesiyle eklenir; yeni rota **eklenmez**.

---

## G) UYGULAMA — 12 ADIM

1. `tokens.css` yazılır, Tailwind v4 `@theme`'e bağlanır; değerler onaylı ekranlardan örneklenip kilitlenir.
2. Syne + Figtree yüklenir (yalnızca kullanılan ağırlıklar: 400/600/700/800); `font-display:swap`.
3. `.em-gold` skew bileşeni ve "başlıkta tek vurgu" lint kuralı eklenir.
4. `lib/catalog.ts`: katalog okuma, `featured` seçimi, kategori listesi, slug çözümleme — saf fonksiyonlar, birim testli.
5. `lib/format.ts`: fiyat ve sayaç formatları, 20 locale için `Intl.NumberFormat` doğrulaması.
6. `i18n/` iskeleti: TR + EN tam, 18 dil EN'den kopyalanıp çeviriye işaretlenir; eksik anahtar EN'ye düşer.
7. `Hero.tsx` + `motion.ts`: B4 ışık/gradyan/ken-burns + `prefers-reduced-motion` dalı.
8. `Nav` + `Footer` + `LanguageSwitcher`: locale segmenti yönlendirmesi, `lang` güncellemesi.
9. `routes/index.tsx`: C1–C6 sırasıyla; `featured` boşsa C2'nin render edilmediği doğrulanır.
10. `routes/shop.tsx` + `routes/p.$slug.tsx`: filtre, boş durum, 404, "benzer ürünler yalnızca katalogdan" kontrolü.
11. `routes/hikaye.tsx`: uzun metin ölçüleri (`68ch`, `hyphens`) ve dil fallback'i test edilir.
12. Kapanış denetimi: yasaklı kelime lint'i 20 dilde çalışır; kontrast ölçümü (≥4.5:1); yatay taşma taraması; 4 sayfa × 20 dil = 80 render'ın hepsi hatasız. Hepsi geçmeden yayın yok.

---

## H) DOKUNULMAYACAKLAR — DÜRÜSTLÜK MADDESİ

1. **Veri dürüstlüğü:** Katalogda olmayan hiçbir şey ekranda olmaz — fiyat, ölçü, malzeme, stok, ürün adedi, "benzer ürün". Boş alan gizlenir, asla doldurulmaz.
2. **Kopya dürüstlüğü:** Uydurma alıntı, müşteri yorumu, ödül, "şu kadar yıldır" iddiası, kurucu ismi, adres — veri kaynağına girmedikçe yazılamaz. Bu şartnamede geçen TR/EN kopya dışında metin üretilmez.
3. **Sayı dürüstlüğü:** Sayaçlar (`{n} parça`) çalışma anında katalogdan hesaplanır; hiçbir sayı sabit yazılmaz, yuvarlanmaz, abartılamaz.
4. **Çeviri dürüstlüğü:** Çevrilmemiş içerik sessizce makine çevirisiyle doldurulmaz; EN fallback görünür biçimde çalışır ve çeviri kuyruğuna işaretlenir.
5. **Görsel dürüstlüğü:** Ürün görseli olmayan kart basılmaz; stok fotoğraf, yapay zekâ üretimi "ürün" görseli veya başka ürünün görseli yer tutucu olarak kullanılmaz.
6. **Etkileşim dürüstlüğü:** Tek CTA Instagram'dır. Sepet, ödeme, form, bülten, sahte canlılık ("şu an 3 kişi bakıyor") eklenmez; eklenmesi teklif edilirse bu maddeye aykırıdır.
7. **Kod dürüstlüğü:** Mevcut dört ekrandan kod taşınmaz; yalnızca onaylı sanat yönetimi referans alınır. Bu şartnamenin dışına çıkan her karar, uygulanmadan önce yazılı onaya döner.

— Şartname sonu.

---

## İkinci tur punch-list

# Detoks.gr — 8 Maddelik Punch-List

**1. Üst bar mesajını sadeleştir.**
"Onaylama kataloğu. Canlı AB/Norveç mağazası değil. Kart çekilmez." — üç cümle tek satırda okunmuyor. Tek cümleye indir: *"Ön izleme kataloğudur — sipariş ve kart bilgisi alınmaz."* İki dilde de aynı kısalık.

**2. Hero başlığı satır kırılımını kilitle.**
"merakı var." vurgusu doğru, ama TR'de 4 satır, EL'de 5 satıra çıkıyor ve şişe görselinin üstüne biniyor. `max-width` sabitle, EL'de punto bir kademe küçült — .em-gold skew -7° bozulmasın.

**3. Ken-burns'ü doğrula.**
Hero'da 6s, bir kez, sonra statik. Sonsuz döngüye düşerse aktarın sakin kimliği bozulur. Mağaza ve PDP görsellerinde ken-burns YOK — sadece ana sayfa.

**4. Altın rengi disiplinini koru.**
#D9A13B yalnızca: vurgu kelime (.em-gold), birincil CTA, fiyat. Şu an PDP'de "TAHA HAZIRLADI" etiketi de altın — onu bakır #C98F4E'ye çek, hiyerarşi netleşsin.

**5. PDP'de "Kaynak notu" bloğunu görünür kıl.**
"Kaynak listedeki tutar. KDV dahil satış fiyatı değil." satırı çok silik. Bu, uydurma stok/yorum yasağının yerine geçen güven cümlesi — ceviz zeminde %85 opaklıkla, fiyatın hemen altında sabit konum.

**6. Vitrin grid'ini gerçek ürün sayısına bağla.**
"271 ürün" iddiası vitrinde 4 kart görünürken inandırıcı değil. Ya vitrini 8 karta çıkar ya da sayaç metnini "271 ürün · fiyat listesinden" yerine "fiyat listesinden seçki" yap. Uydurma kartla doldurma.

**7. Instagram CTA'yı tek yerde topla.**
Header'daki ikon + hero altı + footer üç yerde tekrar etmesin. Header'da ikon kalsın, sayfa sonunda tek satır: *"Sipariş ve sorular için Instagram'dan yazın."* — ikincil buton stili, altın değil bakır çerçeve.

**8. Aktar kimliğini metinlerde pekiştir, mobilyaya sapma.**
Görseller şişe, lokum, ot, elma — doğru yönde. PDP hikâye bloğu ("Bir şişeden önce, bir bahçe kararı.") iyi; aynı anlatı tonunu mağaza sayfasına "Taha'nın notu" olarak 2 cümlelik alıntıyla taşı. Ahşap masa/doku arka planda kalsın, hero'da nesne her zaman ürün olsun.

---
**Not:** Tüm maddeler mevcut 4 görseldeki duruma dayanıyor; tahmini metrik veya var olmayan özellik eklenmedi.