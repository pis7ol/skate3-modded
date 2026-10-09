"""Reproduce the public skate3 game on GitHub Pages with pinned asset hashes."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request,urlopen
import gzip,hashlib,json,shutil,time
manifest=json.loads(Path('base-files.json').read_text());root=Path('public');root.mkdir(exist_ok=True)
def download(item, origin=None):
 target=root/item['path'];target.parent.mkdir(parents=True,exist_ok=True)
 for attempt in range(3):
  try:
   request=Request((origin or manifest['origin'])+'/'+quote(item['path'])+'?pages=version6',headers={'User-Agent':'skate3-pages-builder','Accept-Encoding':'identity'})
   with urlopen(request,timeout=120) as response:data=response.read()
   assert len(data)==item['size'], 'Size mismatch: '+item['path']
   assert hashlib.sha256(data).hexdigest()==item['sha256'], 'Hash mismatch: '+item['path']
   target.write_bytes(data);return item['path']
  except Exception:
   if attempt==2:raise
   time.sleep(2*(attempt+1))
with ThreadPoolExecutor(max_workers=6) as executor:
 for index,name in enumerate(executor.map(download,manifest['files']),1):print(f'{index}/{len(manifest["files"])} {name}',flush=True)
for name in ['index.html','loader.js','characters.js','pack.json','characters.json','audio-settings.js']:shutil.copy2(name,root/name)
ui=root/'assets/reference-ui';ui.mkdir(parents=True,exist_ok=True)
for name in Path('.').glob('ui-*.png'):shutil.copy2(name,ui/name.name.removeprefix('ui-'))
shutil.copy2('reference-CREDITS.json',root/'assets/reference-CREDITS.json');(root/'.nojekyll').touch()
# Upstream maps can change independently of our release. Fetch the exact
# verified versions at build time and publish them alongside our own maps.
# The browser must never mix a live upstream file with stale size/hash metadata.
map_manifest=json.loads(Path('map-files.json').read_text())
with ThreadPoolExecutor(max_workers=4) as executor:
 for name in executor.map(lambda item: download(item,map_manifest['origin']),map_manifest['files']):
  print('Verified map '+name,flush=True)
pack=json.loads((root/'pack.json').read_text())
for item in map_manifest['files']:
 matches=[m for m in pack['maps'] if m['name']==item['name']]
 assert len(matches)==1, 'Unknown or duplicate map: '+item['name']
 matches[0].update(size=item['size'],hash=item['sha256'][:16],parts=[item['path']])
assert all(not part.startswith('http') for m in pack['maps'] for part in m['parts'])
(root/'pack.json').write_text(json.dumps(pack,indent=2)+'\n')
assert not any(m['name'].startswith('HitAndRun') for m in json.loads((root/'pack.json').read_text())['maps'])
print('Verified public game copied; new loading screen and graphics applied. Previous audio retained.')

# New character models are committed compressed, then verified and expanded.
character_dir=root/'characters';character_dir.mkdir(exist_ok=True)
for character in json.loads(Path('characters.json').read_text()):
 archive=Path(character['id']+'.glb.gz')
 if not archive.exists():continue
 data=gzip.decompress(archive.read_bytes())
 assert len(data)==character['size']
 assert hashlib.sha256(data).hexdigest().startswith(character['hash'])
 (root/character['file']).write_bytes(data)
shutil.copy2('character-library-CREDITS.txt',character_dir/'CREDITS.txt')
