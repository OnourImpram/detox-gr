"""Taha'nın dolduracağı ürün formunu üretir: docs/Taha-Urun-Formu.csv (271 satır; UTF-8 BOM, Excel açar) + docs/Taha-Urun-Formu.md.
Kaynak: src/data/catalog-normalized.json (+ varsa src/data/urun-bilgi.json'daki dolu değerler önceden yazılır).
Doldurulan CSV → scripts/urun-bilgi-ice-aktar.py ile urun-bilgi.json'a döner."""
from __future__ import annotations

import csv
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
raw = json.loads((REPO / "src/data/catalog-normalized.json").read_text(encoding="utf-8"))
rows = raw if isinstance(raw, list) else next(v for v in raw.values() if isinstance(v, list))
info = json.loads((REPO / "src/data/urun-bilgi.json").read_text(encoding="utf-8"))
HELD = "İNCELEME ÖNCESİ YAYIN YOK"

SUTUNLAR = ["id", "durum", "ad (kaynak)", "kategori (kaynak)", "fiyat (kaynak, €)", "fiyat birimi (kaynak)", "kaynak miktar",
            "gramaj (net g) *", "satış birimi (adet/paket/şişe/kavanoz/kg) *", "kim hazırladı (Taha / üretici adı) *",
            "içindekiler (gıda) *", "alerjen (gıda) *", "menşe (ülke/bölge) *", "son kullanma / raf ömrü",
            "INCI (kozmetik) *", "sorumlu kişi (kozmetik)", "stok (adet)", "KDV dahil mi (E/H) *", "foto dosya adı", "ad düzeltme (TR)", "not"]

csv_yol = REPO / "docs/Taha-Urun-Formu.csv"
with csv_yol.open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(SUTUNLAR)
    for r in rows:
        i = r["source_record_id"]
        b = info.get(i) if isinstance(info.get(i), dict) else {}
        w.writerow([
            i, "YAYIN BEKLİYOR" if r.get("editorial_status") == HELD else "VİTRİNDE",
            r.get("source_name", ""), r.get("source_category", ""), r.get("source_price") or "", r.get("source_price_basis") or "",
            f"{r.get('source_quantity') or ''} {r.get('source_unit') or ''}".strip(),
            b.get("grams", ""), b.get("unit", ""), b.get("producer", ""), b.get("ingredients", ""), b.get("allergens", ""),
            b.get("origin", ""), b.get("bestBefore", ""), b.get("inci", ""), b.get("responsiblePerson", ""), b.get("stock", ""),
            "" if b.get("vatIncluded") is None else ("E" if b.get("vatIncluded") else "H"),
            (b.get("image") or "").split("/")[-1], b.get("nameTr", ""), b.get("note", ""),
        ])

md = f"""# Taha — Ürün Formu (nasıl doldurulur)

Dosya: `Taha-Urun-Formu.csv` (Excel'de açılır; ayraç `;`). {len(rows)} satır: {sum(1 for r in rows if r.get('editorial_status') != HELD)} ürün vitrinde, {sum(1 for r in rows if r.get('editorial_status') == HELD)} ürün "YAYIN BEKLİYOR" (hastalık adı / kimliği belirsiz — danışman onayı olmadan yayınlanmaz).

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
| foto dosya adı | Gönderdiğin fotoğrafın adı (telefon yeter; ürün tek, etiket okunaklı) | `DT117.jpg` |
| ad düzeltme (TR) | Sitedeki ad yanlışsa doğrusu | `Elma sirkesi 500 ml` |

Fotoğraflar: dosya adı ürün `id`'siyle aynı olsun (`DT117.jpg`); birden fazla kare için `DT117-2.jpg`. WhatsApp'tan gönderirken "Belge" olarak gönder (sıkıştırmasın).

Geri dönüş: dolu CSV + fotoğraflar → `python scripts/urun-bilgi-ice-aktar.py <csv> <foto klasörü>` → site otomatik güncellenir (gramaj, birim, içindekiler, alerjen, fotoğraf, stok).
"""
(REPO / "docs/Taha-Urun-Formu.md").write_text(md, encoding="utf-8")
print("CSV satır", len(rows), "→", csv_yol.name, "| md yazıldı")
