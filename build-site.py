"""Reproduce the public skate3 game on GitHub Pages with pinned asset hashes."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request,urlopen
import hashlib,json,shutil,time
manifest=json.loads(Path('base-files.json').read_text());root=Path('public');root.mkdir(exist_ok=True)
def download(item):
 target=root/item['path'];target.parent.mkdir(parents=True,exist_ok=True)
 for attempt in range(3):
  try:
   request=Request(manifest['origin']+'/'+quote(item['path'])+'?pages=version6',headers={'User-Agent':'skate3-pages-builder','Accept-Encoding':'identity'})
   with urlopen(request,timeout=120) as response:data=response.read()
   assert len(data)==item['size'], 'Size mismatch: '+item['path']
   assert hashlib.sha256(data).hexdigest()==item['sha256'], 'Hash mismatch: '+item['path']
   target.write_bytes(data);return item['path']
  except Exception:
   if attempt==2:raise
   time.sleep(2*(attempt+1))
with ThreadPoolExecutor(max_workers=6) as executor:
 for index,name in enumerate(executor.map(download,manifest['files']),1):print(f'{index}/{len(manifest["files"])} {name}',flush=True)
for name in ['index.html','loader.js','characters.js']:shutil.copy2(name,root/name)
ui=root/'assets/reference-ui';ui.mkdir(parents=True,exist_ok=True)
for name in Path('.').glob('ui-*.png'):shutil.copy2(name,ui/name.name.removeprefix('ui-'))
shutil.copy2('reference-CREDITS.json',root/'assets/reference-CREDITS.json');(root/'.nojekyll').touch()
assert not any(m['name'].startswith('HitAndRun') for m in json.loads((root/'pack.json').read_text())['maps'])
print('Verified public game copied; new loading screen and graphics applied. Previous audio retained.')
