"""Shopify mağazası açıldığında: Storefront API'den SKU → varyant gid eşlemesini çeker, src/data/shopify-varyant.json'a yazar.
Ön koşul: ürünler Shopify'a SKU = source_record_id (DT###) ile aktarılmış olmalı (data/shopify-products.csv, Hydrogen turundan).
Env: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, [SHOPIFY_API_VERSION=2025-07]. Kullanım: python scripts/shopify-varyant-esle.py [--kuru]
Çıkış: eşlenen/eksik sayısı; eksikler listelenir (Shopify'da olmayan ürün satışa çıkmaz — sunucu 'unknown' döner)."""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
domain = (os.environ.get("SHOPIFY_STORE_DOMAIN") or "").strip().removeprefix("https://").rstrip("/")
token = (os.environ.get("SHOPIFY_STOREFRONT_TOKEN") or "").strip()
version = (os.environ.get("SHOPIFY_API_VERSION") or "2025-07").strip()
if not domain or not token:
    sys.exit("SHOPIFY_STORE_DOMAIN ve SHOPIFY_STOREFRONT_TOKEN gerekli (06-Altyapi/secrets/api-anahtarlari.env'den yükle)")

QUERY = """query($cursor: String) {
  products(first: 100, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { title variants(first: 20) { nodes { id sku availableForSale } } }
  }
}"""

def gql(variables: dict) -> dict:
    req = urllib.request.Request(f"https://{domain}/api/{version}/graphql.json",
                                 data=json.dumps({"query": QUERY, "variables": variables}).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token})
    with urllib.request.urlopen(req, timeout=60) as r:
        out = json.loads(r.read().decode("utf-8"))
    if out.get("errors"):
        sys.exit(f"GraphQL hata: {out['errors']}")
    return out["data"]

sku_to_gid: dict[str, str] = {}
cursor = None
while True:
    d = gql({"cursor": cursor})
    for p in d["products"]["nodes"]:
        for v in p["variants"]["nodes"]:
            if v.get("sku"):
                sku_to_gid[v["sku"].strip()] = v["id"]
    if not d["products"]["pageInfo"]["hasNextPage"]:
        break
    cursor = d["products"]["pageInfo"]["endCursor"]

raw = json.loads((REPO / "src/data/catalog-normalized.json").read_text(encoding="utf-8"))
rows = raw if isinstance(raw, list) else next(v for v in raw.values() if isinstance(v, list))
ids = [r["source_record_id"] for r in rows if r.get("editorial_status") != "İNCELEME ÖNCESİ YAYIN YOK"]
eslenen = {i: sku_to_gid[i] for i in ids if i in sku_to_gid}
eksik = [i for i in ids if i not in sku_to_gid]
hedef = REPO / "src/data/shopify-varyant.json"
mevcut = json.loads(hedef.read_text(encoding="utf-8"))
yeni = {"_": mevcut.get("_"), **eslenen}
if "--kuru" not in sys.argv:
    hedef.write_text(json.dumps(yeni, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"Shopify'da SKU'lu varyant: {len(sku_to_gid)} | vitrin eşlenen: {len(eslenen)}/{len(ids)} | eksik: {len(eksik)}")
if eksik:
    print("eksik:", ", ".join(eksik[:40]), "…" if len(eksik) > 40 else "")
