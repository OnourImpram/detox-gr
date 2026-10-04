"""Reproducible, metadata-free WebP preparation. Originals are never modified.
Usage: python scripts/prepare-photos.py /path/to/extracted/archive
Pillow required. The observations file describes appearance, not verified SKU identity.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image,ImageOps
import json,hashlib,sys,csv
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1]).resolve()
OBS=json.loads((ROOT/'docs/brand/photo-observations.json').read_text())
OUTPUT=ROOT/'public/photos/taha-2026';OUTPUT.mkdir(parents=True,exist_ok=True)
assert set(OBS)=={p.name for p in SOURCE.glob('*.JPG')},'Missing or unexpected original'
def process(item):
 name,meta=item;p=SOURCE/name
 sha=hashlib.sha256(p.read_bytes()).hexdigest()
 with Image.open(p) as source:
  original_size=source.size
  source.draft('RGB',(1600,1000))
  image=ImageOps.exif_transpose(source).convert('RGB')
  variants=[]
  for width in [400,800,1440]:
   dest=OUTPUT/f'{meta["id"]}-{width}.webp'
   clone=image.copy();clone.thumbnail((width,9999),Image.Resampling.LANCZOS)
   if not dest.exists():clone.save(dest,'WEBP',quality=83,method=4,exif=b'')
   variants.append({'src':'/photos/taha-2026/'+dest.name,'width':clone.width,'height':clone.height,'bytes':dest.stat().st_size})
 return {**meta,'original':name,'sha256':sha,'originalWidth':original_size[0],'originalHeight':original_size[1],'variants':variants}
with ThreadPoolExecutor(max_workers=4) as pool:photos=list(pool.map(process,OBS.items()))
manifest={'version':1,'sourceArchive':'taha-foto-kucuk.zip','source':'Provided by the project owner, 2026-10-04','reviewNote':'Observed subjects are not botanical, brand, batch or SKU verification. No image alone grants sale approval.','photos':photos}
(ROOT/'src/data/photo-archive.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
with (ROOT/'docs/brand/photo-register.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['original','web_name','visual_subject','group','sku_verified','sha256','owner_confirmed_sku'])
 for p in photos:w.writerow([p['original'],p['id'],p['subject'],p['group'],'NO',p['sha256'],''])
print(json.dumps({'photos':len(photos),'derivatives':sum(len(p['variants']) for p in photos),'bytes':sum(v['bytes'] for p in photos for v in p['variants'])}))
