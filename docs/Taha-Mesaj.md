# Taha'ya gönderilecek paket (WhatsApp)

Ekler: `Taha-Urun-Formu.csv` (Excel'de açılır), `Taha-Urun-Formu.md` (nasıl doldurulur). Sorular aşağıda; tek tek cevaplanabilir.

---

Taha selam. Site büyük ölçüde hazır; kalan her şey senin elindeki bilgiler. Üç şey lazım:

**1) Excel formu** (ekte, 271 satır). Yıldızlı sütunlar satış için şart: gramaj, satış birimi (adet/paket/şişe/kavanoz/kg), kim hazırladı (sen / üretici adı), içindekiler ve alerjen (gıda), menşe, INCI (sabun/krem/yağ), stok, fiyat KDV dahil mi. Bilmediğin hücreyi boş bırak — siteye hiçbir şey uydurulmuyor, boş alan görünmüyor.

**2) Fotoğraf** — iki parça:
- (a) Stüdyo çekimindeki 151 kâse karesi elimizde (`kontak-01.jpg` … `kontak-08.jpg` ekte; her karenin altında dosya adı var, ör. `MF8A6403`). Hangi kare hangi ürünse, formdaki **"foto dosya adı"** hücresine o adı yaz — başka bir şey gerekmiyor.
- (b) Kâsede olmayan ürünler (lokum, sabun, sirke, pekmez, bal, yağ, krem…): ilk 30 ürün için yeter, telefon yeter: ürün tek başına, etiket okunaklı, gün ışığı. Dosya adı ürünün kodu olsun (formdaki `id`: DT117.jpg gibi). WhatsApp'tan "Belge" olarak gönder ki sıkıştırmasın.
- Şu an sitede bu ürünler "Temsili görsel." etiketli natürmortla duruyor; senin fotoğrafın gelince yerine geçiyor.

**3) Kısa sorular** (tek cümle yeter):
1. Dükkân hangi yıl açıldı? (Yıl ancak onaylarsan sitede geçer.)
2. Aktarlığı nasıl öğrendin — usta, kurs, kitap?
3. "Detoks" adı nereden geliyor?
4. Sirke ve tarhana dışında kendi hazırladığın ürünler hangileri? (Yağ? Sabun? Lokum? Pekmez?)
5. Sirkenin elmaları nereden?
6. Tarhananın içindekiler neler, nerede kurutuluyor?
7. Lokum ve pekmezi kim üretiyor; adları sitede yazsın mı?
8. Ballar kimden? (Çam, püren, kestane ayrı ayrı.)
9. Biagros ve Creta Carob dışında adını yazabileceğimiz üretici var mı? Bioaromafarm tedarikçin mi?
10. Dükkânın içinde ne var: ahşap raf, terazi, tezgâh? Dükkânın cephesinden ve içinden birer fotoğraf, bir de kendi portren (hikâye sayfası için) — elinde varsa gönder, yoksa telefonla çekilir; şu an sitede bunların yerinde kâse fotoğrafları var.
11. Pazar günü açık mısın?
12. Hikâye sayfasındaki "Ben Taha Hüseyinoğlu…" metnini aynen onaylıyor musun, değiştireyim mi?
13. "Memnuniyet" öne çıkanlarındaki yorumları siteye taşımak için müşterilerden izin alır mısın?
14. İş e-postası açtın mı? (örn. info@detoks.gr)
15. Çelenk logonun vektör ya da yüksek çözünürlüklü dosyası var mı?
16. Hangi taşıyıcıyla gönderiyorsun; ada ve uzak bölgelerde kural ne? Kargo tarifen var mı?
17. Fiyatlar KDV dahil mi?
18. Şu an 2 ürünün fiyatı listede yok: Melomakarno (DT008) ve Narcissa aserola çay (DT172) — fiyatları? (İkisi de şimdilik yayın dışı.)

Bunlar gelince: form → siteye otomatik (gramaj, içindekiler, alerjen, fotoğraf, stok); cevaplar → hikâye ve ürün metinleri kesinleşir. Sonra Shopify mağazasını açıp ödemeyi bağlıyoruz.

---

## Bizim tarafta, cevaplar gelince (3 adım)
1. `python scripts/urun-bilgi-ice-aktar.py docs/Taha-Urun-Formu.csv <foto klasörü>` → `src/data/urun-bilgi.json` + `public/products/taha/` (JPG + WebP) → PDP'de gramaj/içindekiler/alerjen/menşe/üretici/INCI satırları, stok-yok durumu, gerçek fotoğraf ("Temsili görsel." etiketi düşer, "Dükkândan." gelir). Stüdyo kâseleri için foto klasörü `C:/Users/onuri/Projects/detox-assets/foto-src` (MF8A*.JPG); Taha'nın telefon fotoğrafları için WhatsApp indirme klasörü. Portre / cephe gelince: `src/lib/photos.ts` `taha`/`shop` yolları + `photo.taha`/`photo.shop` altyazıları (i18n-messages.ts) güncellenir, 18 dil `gorevler/ceviri-ui-20dil.py` ile.
2. Hikâye + marka metinleri: `docs/Detoks_gr_Marka_Anlatisi.md` §6 cevaplarıyla `[TAHA DOĞRULAYACAK]` etiketleri kapanır; i18n deltası yeniden üretilir (18 dil Flash ile).
3. `python scripts/gorsel-turev.py` (yeni fotoğraflara WebP) → `npm run katalog` → tsc/axe/320 → commit.
