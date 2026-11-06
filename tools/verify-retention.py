"""Fail if retained level data or an archived playable edition was changed."""
from pathlib import Path
import hashlib,json

root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/'archive/manifest.json').read_text(encoding='utf-8'))
for name,digest in manifest['retained_text'].items():
    p=root/name
    assert p.is_file(),f'Retained edition was removed: {name}'
    actual=hashlib.sha256(p.read_text(encoding='utf-8-sig').encode('utf-8')).hexdigest()
    assert actual==digest,f'Retained design was changed: {name}'
print(f"Verified {len(manifest['retained_text'])} retained level/edition files")
