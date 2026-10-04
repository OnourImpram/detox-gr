# Fotoğraftan ürüne. Doğru eşleştirme iş akışı

## Bu teslimatta bulunanlar

Arşivde 151 özgün JPEG vardır. Her fotoğraf görsel olarak incelenmiştir. Web için yeniden adlandırılan 453 WebP türevi hazırlanmıştır. Özgünler değiştirilmez. Web türevlerinde EXIF bulunmaz. Dosya adında görünen konunun betimi ve özgün kare kodu birlikte durur.

Örnek. `gul-tomurcuklari-mf8a6417-800.webp` bir gül tomurcuğu görünümünü betimler. Bir ürün kodunu, bitki türünü, menşei veya parti bilgisini belgelemez.

`photo-register.csv`, bütün özgün dosyaları yeni adlarına bağlar. `src/data/photo-archive.json`, kaynak hash değerleri, boyutlar ve türev yolları için tek kayıttır. `photo-approved.json` henüz boştur. Hiçbir ürün fotoğrafına doğrulanmış ürün statüsü verilmemiştir.

## Kullanılan görseller

Bütün fotoğraflar `/raf` sayfasında kategoriye göre incelenebilir. İlk 24 kare yüklenir, kullanıcı devam ettikçe yenileri gösterilir. Kare büyütülür, Escape ile kapatılır, odak açan düğmeye döner. Ana sayfa, hikâye ve notlar için seçilen kareler gerçek arşiv görüntüleridir. İlgili altyazılar stüdyo kaynağını belirtir.

## Kesinlik düzeyleri

Görsel betimleme. Karede görünen taneler, yapraklar, demetler, kabuklar veya çiçekler tarif edilir. Tür, içerik ve marka sonucuna atlanmaz.

Eşleştirme adayı. Görüntü bir katalog ürünüyle benzeşebilir. Bu yalnız sahibin incelemesini kolaylaştırır. Otomatik ürün ataması değildir.

Sahibin doğruladığı ürün. Taha, özgün kareyi ilgili `DT` ürün koduyla eşleştirir. Kaynak ve onay tarihi kaydedilir. Ancak bundan sonra fotoğraf ürün sayfasının gerçek ürün görseli olarak kullanılabilir.

Etiket ve satış onayı. Fotoğraf eşleştirmesinden ayrıdır. Bir fotoğrafın doğru ürüne ait olması, ürünün satışa uygunluğunu, stok durumunu, içerik bilgisini veya hedef ülke iznini tamamlamaz.

## Taha'nın kontrol etmesi gereken adaylar

Aşağıdaki tablo hızlı inceleme içindir. Hiçbiri otomatik atanmaz.

| Kare | Görsel olarak tarif edilen | Katalog adayı | Kontrol |
| --- | --- | --- | --- |
| MF8A6417 | Gül tomurcukları | DT222 | Aynı ürün mü, aynı satış biçimi mi |
| MF8A6403 | Keten görünümünde taneler | DT220 | Etiket ve fotoğraf kaydı |
| MF8A6571 | Karanfil görünümü | DT205 | Ürün kodu ve satış biçimi |
| MF8A6610 | Kakule kabukları görünümü | DT239 | Tür ve ürün eşleştirmesi |
| MF8A6611 | Yıldız biçimli anason görünümü | DT230 | Botanik kimlik ve doğru ürün |
| MF8A6482 | Muskat görünümünde oval taneler | DT252 | Doğru ürün ve varyant |
| MF8A6527 | Tarçın çubukları | DT265 | Fotoğraf Seylan türünü tek başına doğrulamaz |
| MF8A6565 | Papatya görünümünde çiçek başları | DT211 | Botanik kimlik ve ürün eşleştirmesi |

## Onayın kaydı

Sahibin eşleştirmesinden sonra teknik sorumlu `photo-approved.json` içine ilgili kaydı ekler. `assetId` manifestteki tam kimliktir, dosya adından tahmin edilmez. `sourceId` katalogdaki kalıcı ürün kodudur. `approved`, `reviewedBy` ve geçerli `reviewedAt` alanları zorunludur. Kod, yanlış ürün kodu veya manifestte olmayan varlık için fotoğrafı atamaz. Mevcut ayrıca doğrulanmış ürün görseli varsa onun önceliği korunur.

```json
{
  "DT222": {
    "assetId": "gul-tomurcuklari-mf8a6417",
    "sourceId": "DT222",
    "approved": true,
    "reviewedBy": "Taha",
    "reviewedAt": "2026-10-04"
  }
}
```

Bu yalnız kayıt biçimi örneğidir. Gerçek onay alınmadan kopyalanmamalıdır. Bu teslimatta onay dosyası boş bırakılmıştır.

## Yeni fotoğraf geldiğinde

Özgün dosyayı değiştirmeden arşivleyin. Etiketi veya parti bilgisini ayrıca alın. Görsel betimlemeyi kaydedin, gerektiğinde nötr ad kullanın. `scripts/prepare-photos.py` ile web türevlerini üretin. Manifesti, ürün eşleştirmesini ve dosya hash değerlerini test edin. Müşteri sayfasını hem geniş hem dar ekranda inceleyin. Fotoğrafın bir sayfada yükleniyor olması, doğru ürünü gösterdiği anlamına gelmez.
