"""Google Fonts CSS2 çıktısını (scratch'teki gfonts.css) özbarındırmaya çevirir:
her alt-küme woff2'sini public/fonts/ altına indirir, unicode-range korunarak @font-face bloğunu üretir
ve src/styles.css'teki [UNVERIFIED] geçici @font-face bloğunun yerine yazar. OFL lisanslı aileler (Syne, Figtree, IBM Plex Mono)."""
from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CSS_IN = Path(sys.argv[1])
FONTS = REPO / "public" / "fonts"
FONTS.mkdir(parents=True, exist_ok=True)

src = CSS_IN.read_text(encoding="utf-8")
blok_re = re.compile(r"/\* (?P<subset>[\w-]+) \*/\s*@font-face \{(?P<govde>.*?)\}", re.S)
ozellik = lambda g, ad: re.search(rf"{ad}:\s*([^;]+);", g).group(1).strip()

ciktilar = []
for m in blok_re.finditer(src):
    g, subset = m.group("govde"), m.group("subset")
    fam = ozellik(g, "font-family").strip("'\"")
    style, weight = ozellik(g, "font-style"), ozellik(g, "font-weight")
    url = re.search(r"url\(([^)]+)\)", g).group(1)
    urange = ozellik(g, "unicode-range")
    slug = fam.lower().replace(" ", "-")
    ad = f"{slug}-{style}-{weight.replace(' ', '-')}-{subset}.woff2"
    hedef = FONTS / ad
    if not hedef.exists():
        urllib.request.urlretrieve(url, hedef)
    ciktilar.append(
        "@font-face {\n"
        f'  font-family: "{fam}";\n'
        f"  font-style: {style};\n"
        f"  font-weight: {weight};\n"
        "  font-display: swap;\n"
        f'  src: url("/fonts/{ad}") format("woff2");\n'
        f"  unicode-range: {urange};\n"
        "}"
    )
    print(f"{ad:56} {hedef.stat().st_size:>6} B")

yeni = ("/* Özbarındırılan yazıtipleri — Google Fonts CSS2 alt-kümelerinden indirildi (OFL), scripts/fontlari-ozbarindir.py.\n"
        "   Harici CDN isteği yok; unicode-range korunur, tarayıcı yalnız gereken alt-kümeyi çeker. */\n"
        + "\n\n".join(ciktilar) + "\n")

styles = REPO / "src" / "styles.css"
s = styles.read_text(encoding="utf-8")
if "--ekle" in sys.argv:
    # additive: mevcut @font-face bloklarına dokunma, yenileri @theme'den hemen önce ekle (ör. Yunanca yedek alt-kümeler)
    son = s.index("@theme {")
    etiket = ("/* Yunanca yedek: Figtree ve IBM Plex Mono Yunanca glif taşımaz → Noto Sans / Noto Sans Mono, yalnız greek "
              "alt-kümesi; yığında Figtree'den sonra gelir (red team RT-A-09). */\n")
    s = s[:son] + etiket + "\n\n".join(ciktilar) + "\n\n" + s[son:]
else:
    bas = s.index("/* [UNVERIFIED] özbarındırılan yazıtipi")
    son = s.index("@theme {")
    s = s[:bas] + yeni + "\n" + s[son:]
styles.write_text(s, encoding="utf-8")
print(f"styles.css: {len(ciktilar)} @font-face yazıldı; public/fonts: {len(list(FONTS.glob('*.woff2')))} dosya")
