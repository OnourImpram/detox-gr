"""Taha'nın doldurduğu Taha-Urun-Formu.csv'yi src/data/urun-bilgi.json'a aktarır; fotoğrafları public/products/taha/<id>.jpg
olarak kopyalar (uzun kenar ≤1600 px, JPEG q85) ve WebP türevini yazar. Boş hücre = alan yazılmaz (uydurma yok).
Kullanım: python scripts/urun-bilgi-ice-aktar.py docs/Taha-Urun-Formu.csv [foto_klasoru] [--kuru]
Çıkış: özet (dolu alan sayıları, eksik fotoğraf listesi); rc=1 CSV'de bilinmeyen id varsa."""
from __future__ import annotations

import csv
import json
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
csv_yol = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO / "docs/Taha-Urun-Formu.csv"
foto_dir = Path(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else None
kuru = "--kuru" in sys.argv
hedef = REPO / "src/data/urun-bilgi.json"
foto_hedef = REPO / "public/products/taha"

raw = json.loads((REPO / "src/data/catalog-normalized.json").read_text(encoding="utf-8"))
rows = raw if isinstance(raw, list) else next(v for v in raw.values() if isinstance(v, list))
gecerli = {r["source_record_id"] for r in rows}
mevcut = json.loads(hedef.read_text(encoding="utf-8"))
sema_notu = mevcut.get("_")

def sayi(v: str):
    v = v.strip().replace(",", ".")
    if not v:
        return None
    try:
        return int(float(v)) if float(v).is_integer() else float(v)
    except ValueError:
        return None

def foto_isle(kaynak: Path, kimlik: str) -> str | None:
    """Fotoğrafı küçültüp kopyalar; Pillow yoksa olduğu gibi kopyalar. Dönüş: site yolu."""
    foto_hedef.mkdir(parents=True, exist_ok=True)
    out = foto_hedef / f"{kimlik}.jpg"
    if kuru:
        return f"/products/taha/{kimlik}.jpg"
    try:
        from PIL import Image, ImageOps
        im = ImageOps.exif_transpose(Image.open(kaynak)).convert("RGB")
        im.thumbnail((1600, 1600))
        im.save(out, "JPEG", quality=85, optimize=True, progressive=True)
        im.save(out.with_suffix(".webp"), "WEBP", quality=80, method=6)
    except ImportError:
        shutil.copyfile(kaynak, out)
    return f"/products/taha/{kimlik}.jpg"

bilinmeyen, eksik_foto, dolu = [], [], {}
with csv_yol.open(encoding="utf-8-sig", newline="") as f:
    okuyucu = csv.DictReader(f, delimiter=";")
    for satir in okuyucu:
        kimlik = (satir.get("id") or "").strip()
        if kimlik not in gecerli:
            if kimlik:
                bilinmeyen.append(kimlik)
            continue
        b: dict = {}
        g = sayi(satir.get("gramaj (net g) *", ""))
        if g is not None:
            b["grams"] = g
        for sutun, alan in [("satış birimi (adet/paket/şişe/kavanoz/kg) *", "unit"), ("kim hazırladı (Taha / üretici adı) *", "producer"),
                            ("içindekiler (gıda) *", "ingredients"), ("alerjen (gıda) *", "allergens"), ("menşe (ülke/bölge) *", "origin"),
                            ("son kullanma / raf ömrü", "bestBefore"), ("INCI (kozmetik) *", "inci"), ("sorumlu kişi (kozmetik)", "responsiblePerson"),
                            ("ad düzeltme (TR)", "nameTr"), ("not", "note")]:
            v = (satir.get(sutun) or "").strip()
            if v:
                b[alan] = v
        st = sayi(satir.get("stok (adet)", ""))
        if st is not None:
            b["stock"] = int(st)
        kdv = (satir.get("KDV dahil mi (E/H) *") or "").strip().upper()
        if kdv in ("E", "H"):
            b["vatIncluded"] = kdv == "E"
        foto = (satir.get("foto dosya adı") or "").strip()
        if foto:
            kaynak = (foto_dir / foto) if foto_dir else None
            if kaynak and kaynak.exists():
                b["image"] = foto_isle(kaynak, kimlik)
            else:
                eksik_foto.append(f"{kimlik}: {foto}")
        if b:
            dolu[kimlik] = {**(mevcut.get(kimlik) if isinstance(mevcut.get(kimlik), dict) else {}), **b}

yeni = {"_": sema_notu, **{k: v for k, v in mevcut.items() if k != "_" and k not in dolu}, **dolu}
if not kuru:
    hedef.write_text(json.dumps(yeni, ensure_ascii=False, indent=1), encoding="utf-8")
alan_sayim: dict[str, int] = {}
for v in dolu.values():
    for k in v:
        alan_sayim[k] = alan_sayim.get(k, 0) + 1
print(f"{'KURU ' if kuru else ''}aktarılan ürün: {len(dolu)} | alanlar: {alan_sayim}")
if eksik_foto:
    print("eksik fotoğraf:", *eksik_foto, sep="\n  ")
if bilinmeyen:
    print("BİLİNMEYEN id:", bilinmeyen)
    sys.exit(1)
