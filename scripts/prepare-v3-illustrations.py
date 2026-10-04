"""Build responsive, fingerprinted illustrations from the supplied conversation images.
Usage: python scripts/prepare-v3-illustrations.py --input-dir /path/to/images
Pillow is a build-time image tool only, never a browser dependency.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'DT117': ('elma-sirkesi', 'rustik_pencerede_elma_şişesi.png', '0bd8cde6-0a33-4b95-b039-f8135d40c611'),
    'DT101': ('uzum-pekmezi', 'rustik_üzüm_pekmezi_natürmortu.png', '2c8ea2a1-a483-4dc3-a7de-3d275e54a2fd'),
    'DT157': ('tarhana', 'rustik_tarhana_ve_ahşap_kaşık.png', '7cfd3555-3f5c-47f7-9387-e4b02c762570'),
    'DT002': ('gul-lokumu', 'güllü_lokum_ve_türk_çayı.png', 'e50c3754-cd23-49da-8905-40206b18f022'),
}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-dir', required=True, type=Path)
    args = parser.parse_args()
    output = ROOT / 'public/media/v3'
    output.mkdir(parents=True, exist_ok=True)
    manifest = {'version': '3.0.0', 'note': 'AI generated illustrative compositions, not photographs of the actual product, packaging, label or batch.', 'products': {}}
    for source_id, (slug, filename, gen_id) in SOURCES.items():
        source = args.input_dir / filename
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
        width, height = image.size
        assert (width, height) == (1448, 1086), f'Unexpected source geometry: {source}'
        entry = {'sourceId': source_id, 'kind': 'illustration', 'verifiedProductPhoto': False,
                 'originalName': filename, 'originalSha256': digest, 'generationId': gen_id,
                 'width': width, 'height': height, 'variants': []}
        for size in (400, 800, 1200, width):
            target_height = round(height * size / width)
            name = f'{slug}-{digest[:10]}-{size}.webp'
            file = output / name
            resized = image.resize((size, target_height), Image.Resampling.LANCZOS)
            resized.save(file, 'WEBP', quality=84, method=6)
            data = file.read_bytes()
            entry['variants'].append({'src': f'/media/v3/{name}', 'width': size, 'height': target_height,
                                      'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        manifest['products'][source_id] = entry
    (ROOT / 'src/data/product-media-v3.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    print('Generated',sum(len(p['variants']) for p in manifest['products'].values()),'assets,',sum(v['bytes'] for p in manifest['products'].values() for v in p['variants']),'bytes')

if __name__ == '__main__':
    main()
