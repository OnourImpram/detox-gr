# Detoks 3.1.0. Üç turun görsel entegrasyonu

5 Ekim 2026. Temel sürüm 461eb058324c1262d9ce3126eb60ef644f5f0960.

Kullanıcı önceki üç turda üretilen 30 ayrı görselin tamamını siteye eklemeyi istedi. Her bir kaynak dosya dosya parmak iziyle kaydedildi. Özgün görseller değiştirilmedi. 400, 800, 1200 ve 1448 piksel genişliğinde 120 WebP dosyası hazırlandı.

Tüm görseller /kompozisyonlar altında ayrı ve erişilebilir bir galeride bulunur. Galeri, Taha'nın gerçek çekimlerini içeren /raf sayfasından ve alt menüden erişilebilir. Gerçek fotoğraf arşivi bu koleksiyonla karıştırılmaz.

20 ürün kimliğine açık temsili eşleştirme yapıldı. Aynı ürüne ait alternatifler ürün sayfasında seçim düğmeleriyle gösterilir. Farklı kompozisyonlar aynı gerçek ambalajın ikinci açısı olarak sunulmaz. Ürün kartı ve liste, o ürünün ana kompozisyonunu kullanır. Doğrulanmış gerçek ürün fotoğrafı ileride eklendiğinde önceliklidir.

Dokuz kategoriye uygun kategori kapakları eklendi. Ana sayfada baharat, kuruyemiş, un görselleri ve hediye seçkisi yer alır. Hediye sayfası yeni seçki kompozisyonunu gösterir. Görsel gerçek bir paket içeriği taahhüdü değildir.

## Yanlış eşleştirme önlemleri

Turuncu kuru kayısı görseli DT131 sarı kayısı için temsili olarak kullanılır, günkurusu DT130 için değil. Pembe tuz görüntüsü beyaz kaya tuzu SKU'suna atanmaz. Pembe sıvı içeren gül kompozisyonu renksiz gül suyu SKU'sunun fotoğrafı gibi sunulmaz. Hurmanın çeşidi görselden doğrulanamaz. Üzerinde marka bulunmayan keçiboynuzu kavanozu üretici ambalajı olarak sunulmaz. Bu kareler bağımsız, açıkça belirtilmiş sunum fikirleri olarak galeride kalır.

Gerçek çekimler, stok, satış, etiket, hukuk, vergi ve ödeme onayları değiştirilmez. Bir üretim görseli hiçbir yoldan gerçek fotoğraf onayına çevrilemez.

## Görsel yerleşim kaydı

| Kimlik | Konu | Kullanım |
| --- | --- | --- |
| R1-01 | gul-lokumu | DT002 |
| R1-02 | kiraz-visne-lokumu | DT001 |
| R1-03 | elma-sirkesi | DT117 |
| R1-04 | uzum-pekmezi | DT101 |
| R1-05 | tarhana | DT157 |
| R1-06 | hurma-kompozisyonu | Bağımsız temsili sunum |
| R1-07 | yesil-elma-lif-sabunu | DT018 |
| R1-08 | corekotu-yagi | DT182 |
| R1-09 | sari-kayisi | DT131 |
| R1-10 | kestane-bali | DT097 |
| R2-01 | nar-lokumu | DT006 |
| R2-02 | antep-fistikli-lokum | DT010 |
| R2-03 | lavanta-lif-sabunu-yuvarlak | DT021 |
| R2-04 | cam-bali-kompozisyonu | DT096 |
| R2-05 | keciboynuzu-pekmezi-kompozisyonu | Bağımsız temsili sunum |
| R2-06 | susam-yagi | DT186 |
| R2-07 | tam-bugday-unu | DT170 |
| R2-08 | pembe-tuz-kompozisyonu | Bağımsız temsili sunum |
| R2-09 | kuru-incir | DT128, DT129 |
| R2-10 | ceviz | DT132 |
| R3-01 | bergamotlu-cay | DT235 |
| R3-02 | gul-temali-bakim | Bağımsız temsili sunum |
| R3-03 | kiraz-lokumu-cay | DT001 |
| R3-04 | lavanta-lif-sabunu-kare | DT021 |
| R3-05 | cam-puren-bali | DT096 |
| R3-06 | kuru-incir-kase | DT128, DT129 |
| R3-07 | ceviz-kase | DT132 |
| R3-08 | bugday-unu-cuval | DT169 |
| R3-09 | hediye-seckisi | Ana sayfa, hediye sayfası ve kompozisyon galerisi |
| R3-10 | baharat-bitki-seckisi | Bağımsız temsili sunum |

## Doğrulama

`scripts/three-rounds.test.mjs`, 30 özgün kaynağı, 120 türevi, parmak izlerini, eşleştirmeleri, 20 dilin arayüz kapsamını ve gerçek fotoğraf arşivinin bütünlüğünü denetler. Önceki 307 test korunur. Yeni testlerin ilk turu beklenen yedi eksiklikte başarısız oldu, uygulamadan sonra sekizi de geçti.

`scripts/three-rounds-browser.mjs`, bütün kompozisyonları gerçek tarayıcıda yükler, her ürünün ana görselini ve alternatiflerini sınar. Üç yeni sayfayı 20 dilde 320 piksel genişlikte kontrol eder. Aynı komut SITE_URL ve EXPECTED_COMMIT ile yayın sonrasında gerçek site üzerinde çalışır. Başarılı dağıtım tek başına canlı doğrulama sayılmaz.

Yerel Chromium ilk navigasyonu ortam politikası nedeniyle engelledi. Bu durum site hatası veya başarılı yerel tarayıcı testi olarak raporlanmadı. Gerçek tarayıcı denetimi GitHub Actions üzerinde yürütülür. Son iş akışı günlükleri ve ekran görüntüleri tamamlanma kanıtıdır.
