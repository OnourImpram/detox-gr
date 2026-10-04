# Taha — Ürün Formu (nasıl doldurulur)

Dosya: `Taha-Urun-Formu.csv` (Excel'de açılır; ayraç `;`). 271 satır: 226 ürün vitrinde, 45 ürün "YAYIN BEKLİYOR" (hastalık adı / kimliği belirsiz — danışman onayı olmadan yayınlanmaz).

Yıldızlı (*) sütunlar satış için zorunlu. Bilmediğin hücreyi BOŞ bırak; siteye hiçbir şey uydurulmaz, boş alan gösterilmez.

| Sütun | Ne yazılır | Örnek |
|---|---|---|
| gramaj (net g) | Paketin net ağırlığı, gram | `500` |
| satış birimi | Müşteri neyi alıyor: adet / paket / şişe / kavanoz / kg | `şişe` |
| kim hazırladı | `Taha` ya da üreticinin adı (etikette yazan) | `Taha` / `Creta Carob` |
| içindekiler (gıda) | Etiketteki sırayla, virgülle | `Şeker, mısır nişastası, gül suyu, sitrik asit` |
| alerjen (gıda) | Etiketteki alerjenler; yoksa `yok` | `Antep fıstığı` |
| menşe | Ülke / bölge | `Rodop, Yunanistan` |
| son kullanma / raf ömrü | Ay olarak ya da tarih biçimi | `12 ay` |
| INCI (kozmetik) | Sabun/krem/yağ için etiketteki INCI listesi | `Sodium Olivate, Aqua, …` |
| sorumlu kişi (kozmetik) | AB kozmetik sorumlu kişisi (üretici ya da sen) | `Detoks Aktar, Mpizaniou 14, Komotini` |
| stok (adet) | Şu an raftaki adet; `0` = stokta yok | `12` |
| KDV dahil mi | Listedeki fiyat KDV dahil satış fiyatı mı: `E` / `H` | `E` |
| foto dosya adı | Gönderdiğin fotoğrafın adı (telefon yeter; ürün tek, etiket okunaklı) **ya da** stüdyo kontak sayfasındaki (`kontak-01…08.jpg`) kare adı | `DT117.jpg` ya da `MF8A6403.JPG` |
| ad düzeltme (TR) | Sitedeki ad yanlışsa doğrusu | `Elma sirkesi 500 ml` |

Fotoğraflar: dosya adı ürün `id`'siyle aynı olsun (`DT117.jpg`); birden fazla kare için `DT117-2.jpg`. WhatsApp'tan gönderirken "Belge" olarak gönder (sıkıştırmasın).

Geri dönüş: dolu CSV + fotoğraflar → `python scripts/urun-bilgi-ice-aktar.py <csv> <foto klasörü>` → site otomatik güncellenir (gramaj, birim, içindekiler, alerjen, fotoğraf, stok).
