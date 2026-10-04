# Detoks v3.0.0

## Kullanıcıya görünen değişiklikler

Dört yeni temsili kompozisyon artık gerçek ürün kartlarına, ürün sayfalarına ve listeye ortak ürün kimliği üzerinden bağlanır. Üretilmiş görseller yalnız DT117, DT101, DT157 ve DT002 için kullanılır. Gerçek ambalaj, etiket, parti veya içerik fotoğrafı olarak sunulmaz. Yeni dosya adlarında kaynak parmak izi ve boyut bulunur. Eski WebP önbelleği, yeni JPEG'in yerine görünemez.

Dört açıkça tanımlanan botanik ürün için Taha'nın arşivinden referans fotoğraf kullanılır. Bunlar karanfil, gül tomurcuğu, yıldız anason ve kakuledir. Arşiv fotoğrafı statüsü, satılan çeşitle birebir onay değildir. Referanslar yağ, toz, karışım veya Seylan tarçını gibi görünümden çıkarılamayan sınıflara yayılmaz. Onaylı ürün fotoğrafı geldiğinde ona öncelik verilir.

Diğer ürünlerde ilgisiz kavanoz, dükkân, yağ şişesi veya bitki fotoğrafı yerine açık ve tasarlanmış bir fotoğraf hazırlanıyor durumu gösterilir. Bu karar, 226 ürünün görsel eşleştirmesi tamamlandı demek değildir. Katalogda 4 temsili kompozisyon, 4 arşiv referansı ve 218 bekleyen fotoğraf vardır. Doğrulanmış ürün fotoğrafı onayı henüz sıfırdır.

Kartların görselleri 4:3 oranında bütün olarak görünür. Eksik gramaj fiyat satırını yukarı taşımaz. Eksik fiyat çizgiyle değil bilgi isteme çağrısıyla açıklanır. Ana sayfada başlangıç ürünleri uzun iki raf anlatısından önce yer alır. Gerçek stüdyo fotoğrafları korunur. Masaüstü üst alan araması çalışır. Ürün sayfasından geri dönüş katalog filtrelerini ve kaydırma konumunu korur.

## Temizlik ve performans

Eski sentetik ürün kütüphanesi, kullanılmayan platform simgeleri ve yanıltıcı eski adlarla duran yinelenmiş fotoğraf dışa aktarımları yayına giden public dizininden çıkarılır. Her kaldırılan dosyanın eski SHA256 değeri ve gerekçesi RETIRED_MEDIA.json içinde kaydedilir. Git geçmişinden geri alınabilir. Taha'nın 151 kayıtlı çekimi ve 453 WebP türevi byte düzeyinde korunur.

Editöryal metinlerin 20 dildeki tamamı başlangıç koduna alınmaz. Ana kaynak dosya korunur, dil başına oluşturulan paket yalnız gerektiğinde yüklenir. Üretim sunucusu seçilen dil paketini HTML üretmeden bekler. Tüm dillerin ana kaynakla eşitliği test edilir. Bu teknik eşitlik, bütün ürün açıklamalarında insan editör onayı anlamına gelmez.

Uygulamanın kendi simgeleri ve göreli manifest kapsamı vardır. Grok platform katmanı ortam değişkeniyle yeniden açılamaz. Sürüm numarası paket metadata'sında, alt alanda ve version.json içinde bulunur. Hata sayfasının yenileme düğmesi çalışır. Ödeme ve satış onayları kapalı kalır.

## Doğrulama

npm test. Birim testleri ve mevcut entegrasyon denetimleri.
npm run audit:v3. Fotoğraf koruma, üretilmiş görsel hashleri, eski dosya kalıntıları ve sürüm denetimi.
npm run typecheck. TypeScript kontrolü.
npm run lint. Statik kod kontrolü.
npm run build:pages. Statik önizleme.
npm run build. Sunuculu dağıtım derlemesi.

Tarayıcı paketleri gerçek DOM currentSrc değerini, kartlarda fiyat hizasını, ürün ve liste bağlantılarını, dar ekranları, arama ve geri dönüş akışını, tüm yeni görsel varyantlarının HTTP yanıtını ve hashlerini sınar. Bozuk bir görsel yanıtı ayrı bir hata enjeksiyonunda bekleyen görsel durumuna geçmelidir. Normal akıştaki hatalar bastırılmaz.

Yerel ortamın yönetilen Chromium politikası URL açmayı engeller. Bu politika değiştirilmez. Gerçek tarayıcı denetimleri GitHub Actions üzerinde çalıştırılır ve sonuç görüntüleri incelenir. Yerel ortamda sunucu HTML'i, testler ve derlemeler ayrıca sınanır. Son CI artefaktı sonuçların otoritesidir.

## Yayın sınırı

Bu dalda v3 uygulaması hazırlanır. main birleştirilmeden mevcut ana adresin değiştiği iddia edilmez. Shopify bağlantısı, gerçek ürün ve etiket onayları, işletme bilgileri, hukuk ve vergi incelemesi, taşıyıcı tarifeleri ve gerçek test siparişleri yayın öncesinde tamamlanır. Bir görseli değiştirmek hiçbir ticari onayı otomatik açmaz.

## Teknik dayanaklar

TanStack Router scroll restoration. https://tanstack.com/router/latest/docs/guide/scroll-restoration
MDN responsive images. https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
