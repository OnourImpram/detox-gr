# Detoks v4.0.0

Taha Hüseyinoğlu'nun Gümülcine'deki aktarının 20 dilli dijital vitrini. Küçük işletmenin kimliğini koruyan, ürün doğruluğu ve sürdürülebilir işletim üzerine kurulu bir Avrupa pazarı modeli.

## Görsel sistem

Kullanıcının açık yeniden tasarım talebi üzerine eski ceviz ve Syne ağırlıklı görünüm, botanik ve editöryal bir sisteme dönüştürüldü. Açık kâğıt yüzeyler, koyu zeytin mürekkebi, Literata başlıklar ve Figtree arayüz yazısı kullanılır. Tasarımın otoritesi `DESIGN.md`, gerekçeleri `docs/design/BRIEF-v4.md` içindedir. Eski sürüm belgelerindeki renk ve yazı tipi kararları tarihsel kayıttır.

Ana sayfa, gerçek arşiv fotoğrafını ziyaretçinin seçimiyle değiştirir. Otomatik dönen slayt veya kaydırma müdahalesi yoktur. İki raf bölümü, kategori pencereleri, hediye ve yazılar farklı kompozisyonlara sahiptir. Katalog ve ürün sayfaları aynı kimliği taşır, fakat görev odaklı düzenlerini korur. Kontroller, açıklamalar ve mobil menü aynı semantik renk sistemini kullanır.

Referans olarak kullanıcının paylaştığı Impeccable, Taste Skill, Open Design, Apple Design Skill, UI UX Pro Max, Iris, Awesome Design Skills ve img2threejs depoları incelendi. Kullanılan ilkeler ve bu proje için uygun bulunmayan öneriler tasarım brifinde ayrılır. Bu depoların araçları topluca kurulmadı, başka bir sitenin şablonu kopyalanmadı.

## Katalog ve görsel doğruluğu

271 kaynak kayıt, 226 önizlenebilir ürün ve incelemede tutulan 45 ürün korunur. Bu sürüm katalog, stok, etiket veya satış onaylarını değiştirmez. Doğrulanmamış fotoğrafı eksik ürüne otomatik bağlamaz.

Taha'nın 151 gerçek çekimi, 453 WebP türevi, üç üretim turundaki 30 temsili kompozisyon ve 120 türevi korunur. Arşiv fotoğrafı belirli SKU'nun doğrulanmış resmi değildir. Üretilmiş kompozisyonlar temsili olarak açıklanır. Gerçek ürün eşleştirmeleri `photo-approved.json` ve ürün bilgi hattında ayrı onay gerektirir. `docs/design/PRESERVED.json` tasarım öncesi dosya parmak izlerini kayıt altında tutar.

Fotoğraf arşivi `/raf`, üretilen sahnelerin tümü `/kompozisyonlar` yolundadır. Ürün sayfalarında uygun alternatifler, büyütme ve klavye kullanımı vardır. Bilinmeyen görseller için ilgisiz stok fotoğrafı kullanılmaz.

## Kullanılabilen işlemler

Çok sözcüklü arama, Türkçe ve Yunanca normalizasyonu, tam ürün adına öncelik, kullanıcı onaylı yazım önerileri, kategori ve iki raf filtreleri, görsel filtresi, kart ve liste görünümü, kademeli gösterim desteklenir. Arama, filtre ve dil URL'de korunur. Türkçe seçimi açık `lang=tr` olarak tutulur.

Ürün kartından listeye ekleme, miktar değiştirme, satırı kaldırma ve geri alma vardır. Kilogram ve adet ayrımı talep metninde korunur. WhatsApp bağlantısı mesajı otomatik göndermez. Talep önizlenebilir, kopyalanabilir, pano izni reddedildiğinde elle seçilebilir veya mevcut numara aranabilir. Serbest notlar kalıcı saklanmaz. Yerel depoya yalnız doğrulanmış liste satırları ve ülke tercihi yazılır.

## Satış kilidi

Site katalog önizlemesidir. Gerçek ödeme kapalıdır. `commerce-config.json` mağaza düzeyinde, ürün bilgileri ürün ve hedef ülke düzeyinde onay gerektirir. Bir ödeme anahtarı eklemek bu kapıları açmaz. Yeni ödeme yolu Shopify, eski Stripe kodu makbuz uyumluluğu içindir.

27 AB ülkesi ve Norveç hedef pazardır, güncel teslimat taahhüdü değildir. Mevcut Norveç gıda kısıtı korunur. Ürüne ve ülkeye uygulanabilir ticari, vergi ve hukuk koşulları ayrıca doğrulanmalıdır. `docs/LAUNCH_CHECKLIST.md` ve `docs/REGIONAL_SME_MODEL.md` operasyon sınırlarını açıklar.

## Çalıştırma ve doğrulama

Node 22 ve kilit dosyası kullanılır. Tasarım için yeni çalışma zamanı bağımlılığı eklenmedi. Literata açık kaynak lisansıyla özbarındırılır, tarayıcıdan dış yazı tipi servisine istek gerekmez.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run audit:catalogue
npm run audit:v3
npm run build:pages
node scripts/design-v4-browser.mjs
npm run build
```

Tarayıcı paketleri Playwright Chromium gerektirir. `build:pages`, GitHub Pages alt yolu için `dist/client` çıktısını ve bilinen 258 derin yolun giriş dosyalarını üretir. Statik paylaşım başlıkları varsayılan Türkçedir. Tarayıcıdaki 20 dil deneyimi ayrıdır. `build` sunuculu üretim çıktısı verir. İki derleme art arda çalıştırıldığında test edilecek çıktıyı karıştırmayın.

Kalite iş akışı eski müşteri senaryolarını, tüm görsel dosyaları ve yeni tasarım kontrollerini çalıştırır. Kontrast gerçek hesaplanan renkler üzerinden ölçülür. Ekran görüntüleri ayrıca gözle incelenmelidir. Pages iş akışı ana dalı dağıtır, ardından gerçek public adres ve build commit kimliğini doğrular.

`npm test`, repoda bulunmayan eski platform belgelerine bağlı dört kontrolü ismen kapsam dışında tutar. Bunlar başarılı test sayısına dahil değildir. Otomatik sonuçlar bağımsız güvenlik denetimi, tam WCAG belgesi veya bütün dillerde ana dil editörlüğü anlamına gelmez.

## İçerik bakımı

İşletme gerçekleri ve marka metinleri tasarım kaynaklarından bağımsızdır. Taha'nın onaylamadığı biyografi, menşe, hazırlama biçimi, stok, indirim, müşteri yorumu, sağlık etkisi veya ihracat başarısı eklenmez. Görsel bir değişiklik ürün bilgisini dolaylı olarak değiştirmemelidir. Her yayında ana dal kimliği, ödeme durumu, doğrudan bağlantılar ve farklı dil uzunlukları kontrol edilir.
