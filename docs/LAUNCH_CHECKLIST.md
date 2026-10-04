# Detoks. Satışa açılma kontrolü

Bu belge, 4 Ekim 2026 tarihli geliştirme sürümünün operasyon planıdır. Hukuki uygunluk belgesi değildir. Katalog önizlemesi açıktır, çevrim içi ödeme kapalıdır. Bir API anahtarının bulunması satış izni sayılmaz.

## Mevcut veri

Kaynak katalogda 271 kayıt bulunur. 226 kayıt önizlenebilir, 45 kayıt editöryal incelemede tutulur. Tüm kaynak yayın bayrakları kapalıdır. `urun-bilgi.json` içinde doğrulanmış ürün kaydı yoktur. Gerçek ürün fotoğrafı eşlemesi, stok ve etiket onayları tamamlanmalıdır. Bu sayılar `npm run audit:catalogue` ile yeniden üretilir, satış başarısı veya stok miktarı değildir.

## Sorumluluk ve kanıt

| İş | Sorumlu | Kabul kanıtı |
| --- | --- | --- |
| Marka ve hikâye onayı | Taha | Son metinlerin, biyografinin ve iki raf ayrımının yazılı onayı |
| Ürün kimliği ve etiket | Taha ve ilgili ürün uzmanı | Kaynak kimliği, üretici, kullanım sınıfı, miktar, etiket fotoğrafı |
| Gıda bilgisi | İşletme ve mevzuat danışmanı | Ürüne uygulanabilir içerik, alerjen, muhafaza ve diğer zorunlu bilgiler |
| Kozmetik bilgisi | İşletme ve mevzuat danışmanı | Ürün sınıfı, INCI, sorumlu kişi ve uygulanabilir güvenlik dosyaları |
| İşletme ve sözleşmeler | Taha, muhasebeci ve hukuk danışmanı | Gerçek işletme kimliği, vergi bilgileri, iletişim, satış ve iade metinleri |
| Vergi ve sınır ötesi satış | Muhasebeci | Ülke ve ürün bazında uygulanacak vergi ve faturalama yapılandırması |
| Gönderim | Taha ve taşıyıcı | Ambalajlı ağırlık, kırılabilirlik, ülke, ada ve uzak bölge tarife tablosu |
| Shopify | Teknik sorumlu ve Taha | Gerçek SKU eşlemesi, stok, vergi, teslimat profili, test siparişi ve iade |
| Dil ve erişilebilirlik | Editör ve teknik sorumlu | Dil incelemesi, klavye ve ekran okuyucu kontrolü, mobil testler |
| Son yayın kararı | Taha ve Onour | Onaylı ürün ve ülkeleri belirten yayın kaydı |

## Ürün başına iş akışı

Önce kalıcı `DT` kimliğini kullanın. Kaynak ürün listesini fotoğraf dosyasının adıyla eşleştirmeyin. Fotoğraftaki ürün ve etiketi gözle doğrulayın. Mevcut temsili görselleri gerçek fotoğraf gibi onaylamayın.

Taha ürün formunu doldurur. Veri içe aktarılır ve `urun-bilgi.json` değişikliği gözden geçirilir. Etiket incelemesi ve hedef ülke bilgisi tamamlanır. Yeni onay alanları, mevcut CSV içe aktarıcısı tarafından otomatik verilmez. Teknik sorumlu bunları kanıta göre ayrıca kaydeder.

Satış için kaynak `publish`, ürün `saleApproved`, `labelReviewed`, `vatIncluded`, `approvedMarkets` ve doğrulanmış stok alanları gerekir. Eksik bilgi otomatik olarak olumluya çevrilmez. `labelReviewed` bir kontrol kaydıdır, ürünle ilgili tüm mevzuatı tek başına doğrulamaz. Ürün bazında ek zorunlu alanlar varsa ayrıca tamamlanır.

Miktar ve satış birimi Shopify varyantıyla bire bir uyuşmalıdır. Kilogram fiyatını paket fiyatı gibi kullanmayın. Sıvı hacminden türetilen mevcut gram değeri taşıyıcı için gerçek tartım değildir. Ambalajlı gönderi ağırlığını ölçün. Gerekirse net miktar, hacim ve gönderi ağırlığını ayrı alanlara ayırın.

## Ülke başına iş akışı

27 AB üyesi hedef kapsamda kalır. Norveç ayrı bir hedef pazardır, AB üyesi gibi ele alınmaz. Norveç için mevcut gıda engeli korunur. Ülke seçicisinde görünmek, gönderim taahhüdü değildir.

Bir ülkeyi açmadan önce ürün sınıflandırması, vergi, etiket dili, kargo tarifesi, iade adresi ve müşteri desteği doğrulanır. Sonra hem ürünün `approvedMarkets` alanına hem mağazanın `enabledCountries` listesine eklenir. Shopify Markets ve teslimat profilleri aynı kapsamı yansıtmalıdır. Shopify ödeme ekranında seçilecek teslimat ülkesi de nihai olarak bu kurallara uymalıdır. Ön yüz ülke seçimi tek başına sınırlandırma değildir.

## Mağaza düzeyinde satış kilidi

`src/data/commerce-config.json` içindeki `mode`, `merchantReady`, `legalReady`, `taxReady`, `shippingReady` ve `enabledCountries` alanları varsayılan olarak kapalıdır. İlgili kanıtlar tamamlanmadan değiştirmeyin. Shopify bağlantısı eksikse Stripe'a otomatik geçilmez.

Kaynak fiyat, teyit edilmiş KDV dahil satış fiyatı değildir. Önizlemede fiyatın niteliği açıklanır, demo kargo ücreti tahsil edilecek tutar gibi gösterilmez. Canlı katalog ile Shopify tutarlarının uyuştuğunu her varyantta kontrol edin. Shopify nihai vergi ve teslimat toplamının otoritesidir.

## Canlıya çıkmadan teknik kabul

`npm test`, `npm run typecheck`, `npm run lint`, `npm run audit:catalogue`, `npm run build:pages` ve `npm run build` çalıştırılır. Actions içindeki tarayıcı kontrolü tamamlanır. Ekran görüntüleri ayrıca incelenir. Test sonucu tek başına görsel kalite, WCAG uygunluğu veya hukuki onay değildir.

Gerçek Shopify test modunda ülke, ürün ve dil kombinasyonlarını kontrol edin. Başarılı ödeme, iptal, başarısız ödeme, stok değişimi, tekrar deneme, iade ve sipariş bildirimi senaryoları gerekir. Bu geliştirme turunda gerçek ödeme testi yapılmamıştır.

Sunucu barındırmasında TLS, güvenlik başlıkları, kötüye kullanım sınırlaması, hata izleme ve erişim yetkilerini doğrulayın. Mağaza sırlarını istemciye veya repoya yazmayın. Shopify API sürümünün desteklendiğini yayın tarihinde kontrol edin. `SITE_ORIGINS` gerçek origin değerlerinden oluşmalıdır. GitHub Pages yalnız statik önizlemedir.

Önizleme noindex olarak kalır. Onaylı yayın sırasında canonical origin, hreflang, sitemap, ürün şeması ve paylaşım kartlarını sunucunun gerçek HTML çıktısında yeniden kontrol edin. Eksik ürün kaydını indekslemeyin. Eski URL değişiyorsa yönlendirme planı hazırlayın.

## Taha için günlük iş

Yeni siparişi Shopify'da doğrulayın. Ürün ve varyantı etiketle karşılaştırın. Ambalajı ve kırılma riskini kontrol edin. Takip numarasını kaydedin. Müşteri talebini işlem durumuyla ilişkilendirin. Stok değişikliğini tek merkezden yönetin. Tarayıcıdaki listeyi sipariş defteri olarak kullanmayın.

## Güncel resmî başvuru kaynakları

Bu kaynaklar uygulama kapsamını belirlemek içindir. Ürüne ve ülkeye ilişkin kararlar yayın sırasında uzman tarafından doğrulanmalıdır.

* European Commission, Food information to consumers, distance selling. https://food.ec.europa.eu/food-safety/labelling-and-nutrition/food-information-consumers-legislation/distance-selling_en
* Your Europe, consumer contracts and guarantees. https://europa.eu/youreurope/business/dealing-with-customers/consumer-contracts-guarantees/consumer-contracts/index_en.htm
* Shopify Storefront API, cartCreate. https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate
