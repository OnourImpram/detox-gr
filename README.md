# detoks.gr

Taha Hüseyinoğlu'nun Gümülcine'deki aktarının 20 dilli dijital vitrini. Proje, gerçek bir küçük işletmenin kimliğini koruyarak AB pazarına açılabilecek bir işletim modeli geliştirmeyi amaçlar.

## Bu dalın durumu

`work/detoks-eu-storefront`, mevcut ana sürümden bağımsız geliştirme dalıdır. Çevrim içi ödeme varsayılan olarak kapalıdır. GitHub Pages statik katalog önizlemesidir, sunuculu satış sitesi değildir. Gerçek ödeme, alan adı veya şirket hesabı bu dal tarafından etkinleştirilmez.

Kaynak katalogdaki 271 kayıt korunur. 226 kayıt önizlemede görünür, 45 kayıt editöryal incelemede tutulur. Tüm kaynak yayın bayrakları kapalıdır. Doğrulanmış ürün kaydı ve fotoğraf eşlemesi henüz yoktur. Güncel sayılar `npm run audit:catalogue` ile alınır.

## Deneyim

Yeni ana sayfa ürünleri ve fiyatları uzun hikâye bölümlerinin önüne alır. Ceviz ve bakır kimliği, Syne ve Figtree yazı sistemi korunur. Açık renk ürün alanı, iki raf ayrımı, kategori keşfi ve Taha'nın hikâyesi birlikte çalışır.

Ortak ürün gezgini, Türkçe ve Yunanca karakter normalizasyonu, çok sözcüklü arama, kategori ve raf filtreleri, ad ve fiyat sıralaması, 24 ürünlük kademeli gösterim sağlar. Filtreler ve dil URL'de korunur. Türkçe seçimi açık `lang=tr` olarak saklanır.

Ödeme kapalıyken sepet bir soru listesi olarak çalışır. WhatsApp bağlantısı gerçek ürün kimliklerini ve miktarları içerir. Bağlantı mesajı kendiliğinden göndermez. Tarayıcıda yalnız doğrulanmış liste satırları ve ülke tercihi tutulur. Eski sürümün sipariş ve kişisel veri alanları yeniden açılışta temizlenir. Serbest metin notu kalıcı kaydedilmez.

## Satış sözleşmesi

Katalogda görünmek satış izni değildir. `src/data/commerce-config.json` mağaza düzeyindeki onayları tutar. Her ürün için kaynak yayın bayrağı, etiket ve satış onayı, vergi, hedef ülke, stok ve uygulanabilir ürün bilgisi ayrıca gerekir. API anahtarı tek başına kilidi açmaz. Shopify tek yeni ödeme yoludur. Stripe kodu eski ödeme makbuzu uyumluluğu için tutulur, otomatik ödeme yedeği değildir.

Tüm 27 AB ülkesi ve Norveç hedef olarak korunur. Bu kapsam mevcut teslimat taahhüdü değildir. Norveç için gıda engeli devam eder. Gerçek ürün ve ülke onayları gelmeden hiçbir ülkeye çevrim içi satış açılmaz.

## Çalıştırma

Node 22 kullanılır. Bağımlılık sürümleri mevcut kilit dosyasıyla korunmuştur.

```sh
npm ci
npm run dev
npm test
npm run test:storefront
npm run typecheck
npm run lint
npm run audit:catalogue
npm run build:pages
npm run build
```

Sayfa önizlemesi `dist/client` altına, sunuculu üretim derlemesi Vercel çıktısına yazılır. İki derleme art arda çalıştırılırsa son çıktıyı test ettiğinizden emin olun. `scripts/storefront-browser.mjs`, Pages derlemesi üzerinde Playwright kontrolünü çalıştırır. CI tarayıcıyı kurar ve ekran görüntüleriyle günlükleri artefakt olarak saklar. Bu iş akışı dağıtım yapmaz.

`npm test`, mevcut platformdan kalan dört dış belge testini yalnız ilgili özel belgeler bulunmadığında, isimleri açıkça belirtilerek kapsam dışında bırakır. Bunlar başarılı test gibi raporlanmaz. Diğer platform testleri korunur. Testler ayrı geçici çalışma dizininde yürütülerek mağazanın gerçek OG görseli ile platform test fikstürü karıştırılmaz.

## Veri hattı

`catalog-normalized.json`, kaynak kayıttır. `npm run katalog`, kullanılan alanları `catalog-vitrin.json` dosyasına üretir. Taha ürün formu ve fotoğraf eşlemeleri `urun-bilgi.json` için girdi sağlar. Yeni satış onayları otomatik verilmez. `docs/LAUNCH_CHECKLIST.md` adımları uygulanır.

Yeni arayüz metinleri `src/lib/storefront-copy.ts` içinde 20 dilde bulunur. Mevcut büyük metinler ve sözlükler önceki i18n hattını kullanır. `localized` alanı gözden geçirilmiş ürün metinlerine öncelik verir. Anahtar kapsamı, bütün metinlerin yerel dil uzmanı onayı aldığı anlamına gelmez.

## Görsel ve içerik doğruluğu

Yalnız Taha'nın doğruladığı ürün fotoğrafı gerçek ürün kaydı olarak işaretlenir. Temsili görseller kart ve ürün sayfasında etiketlenir. Dosya adından portre, dükkân veya ürün kimliği çıkarılmaz. Fizyoterapi geçmişi ürünlere tedavi etkisi kazandırmaz. Yapılmayan üretim, doğrulanmayan menşe, stok, müşteri yorumu veya ihracat başarısı yazılmaz.

## Belgeler

* `docs/LAUNCH_CHECKLIST.md`, gerçek satışa geçişte sorumluluklar ve kanıtlar.
* `docs/REGIONAL_SME_MODEL.md`, Batı Trakya'daki küçük işletmeler için tekrar kullanılabilir işletim modeli.
* `docs/WORKLOG.md`, değişiklik ve doğrulama kaydı.
* `docs/superpowers/specs/2026-10-04-detoks-storefront-design.md`, tasarım kapsamı.
* `docs/Detoks_gr_Marka_Anlatisi.md`, mevcut marka kaynağı. Eski önizleme ve ödeme kararları bu dalın güvenlik sözleşmesini geçersiz kılmaz.

## Henüz tamamlanmayan dış bağımlılıklar

Taha'nın ürün ve hikâye onayı, gerçek fotoğraflar, zorunlu ürün bilgileri, işletme ve hukuk metinleri, vergi ve taşıyıcı yapılandırması, Shopify varyantları, yerel dil incelemesi ve gerçek test siparişi gerekir. Bağımsız erişilebilirlik ve güvenlik denetimi yapılmış sayılmaz. Üretim sırları repoya yazılmaz.
