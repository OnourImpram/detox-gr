"""Görsel türevleri: public/products/**/*.jpg ve public/photos/*.jpg için WebP (q80) — tam boy + 1200 + 800 genişlik.
Adlandırma: ad.webp, ad-1200.webp, ad-800.webp (yanında). Var olan ve kaynağından yeni türev atlanır. AVIF: Pillow eklentisi yok, ölçülmedi.
Kullanım: python scripts/gorsel-turev.py [--zorla]. Çıkış: dosya sayısı ve toplam boyut karşılaştırması (JPG vs WebP tam boy)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parents[1]
KAYNAK = [REPO / "public/products", REPO / "public/photos"]
GENISLIKLER = [1200, 800]
zorla = "--zorla" in sys.argv

jpg_toplam = webp_toplam = 0
uretilen = atlanan = 0
manifest: dict[str, dict] = {}  # site yolu → {w: tam genişlik, h: yükseklik, widths: [800, 1200, w]}
for kok in KAYNAK:
    for src in sorted(kok.rglob("*.jpg")):
        jpg_toplam += src.stat().st_size
        hedefler = [(src.with_suffix(".webp"), None)] + [(src.with_name(f"{src.stem}-{w}.webp"), w) for w in GENISLIKLER]
        im = None
        with Image.open(src) as probe:
            tam_w, tam_h = ImageOps.exif_transpose(probe).size
        site_yolu = "/" + src.relative_to(REPO / "public").as_posix()
        manifest[site_yolu] = {"w": tam_w, "h": tam_h, "widths": sorted({w for w in GENISLIKLER if tam_w > w} | {tam_w})}
        for hedef, w in hedefler:
            if hedef.exists() and hedef.stat().st_mtime >= src.stat().st_mtime and not zorla:
                atlanan += 1
                if w is None:
                    webp_toplam += hedef.stat().st_size
                continue
            if im is None:
                im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            out = im
            if w and im.width > w:
                out = im.copy()
                out.thumbnail((w, w * 4))
            elif w and im.width <= w:
                continue  # kaynak zaten küçük: türev gereksiz
            out.save(hedef, "WEBP", quality=80, method=6)
            uretilen += 1
            if w is None:
                webp_toplam += hedef.stat().st_size
(REPO / "src/data/gorsel-turev.json").write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"üretilen {uretilen}, atlanan {atlanan} | JPG toplam {jpg_toplam // 1024} KB → WebP tam boy toplam {webp_toplam // 1024} KB")
