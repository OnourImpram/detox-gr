"""catalog-normalized.json (Codex, 271 kayıt, 194 KB; review_note/source_raw/durum alanları) → src/data/catalog-vitrin.json:
yalnız vitrinin kullandığı alanlar. Kaynak dosya değişince yeniden koş (npm run katalog). İstemci paketini küçültür (red team RT-C-11 sınıfı)."""
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
raw = json.loads((REPO / "src/data/catalog-normalized.json").read_text(encoding="utf-8"))
rows = raw if isinstance(raw, list) else next(v for v in raw.values() if isinstance(v, list))
ALANLAR = ["source_record_id", "source_name", "source_category", "source_price", "source_price_basis", "source_quantity", "source_unit",
           "editorial_title_candidate", "editorial_story_candidate", "editorial_hook_candidate", "review_flags", "editorial_status", "publish"]
ince = [{k: r.get(k) for k in ALANLAR} for r in rows]
out = REPO / "src/data/catalog-vitrin.json"
out.write_text(json.dumps(ince, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{len(ince)} kayıt → {out.name}: {out.stat().st_size // 1024} KB (kaynak {(REPO / 'src/data/catalog-normalized.json').stat().st_size // 1024} KB)")
