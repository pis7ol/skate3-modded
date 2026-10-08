// Extend the published engine's existing Game Menu / Custom models row.
export async function characterMenu(maps = [], currentMap = '') {
  const response = await fetch('characters.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Cannot load the character library');
  const library = await response.json();
  const params = new URLSearchParams(location.search);
  let saved = null;
  try { saved = localStorage.getItem('springfield-character'); } catch {}
  let wanted = params.get('character') ?? saved ?? 'bart-fortnite';
  if (['steve','marge','bart-fmv','homer','peely'].includes(wanted)) {
    wanted = 'bart-fortnite';
    try { localStorage.setItem('springfield-character',wanted); } catch {}
    params.set('character',wanted);
    history.replaceState(null,'',`${location.pathname}?${params}`);
  }
  const selected = library.find(entry => entry.id === wanted) ?? null;
  const current = selected?.id ?? 'stock';
  const canvas = document.getElementById('bevy');
  // The engine's own menu now owns map changes and pause/resume.
  document.getElementById('mapbar').hidden = false;
  document.getElementById('mapbar').style.display = 'flex';
  const entry = document.createElement('button'); entry.id = 'custom-models-entry';
  entry.textContent = 'Custom models'; entry.title = 'Custom models'; entry.setAttribute('aria-label','Custom models'); entry.hidden = true;
  document.body.append(entry);
  const mapEntry = document.createElement('button'); mapEntry.id = 'maps-entry'; mapEntry.hidden = true;
  mapEntry.setAttribute('aria-label','Select map');
  const mapLabel = document.createElement('span'); mapLabel.textContent = 'Map';
  const mapName = document.createElement('span'); mapName.textContent = currentMap;
  mapEntry.append(mapLabel,mapName); document.body.append(mapEntry);
  const mapPanel = document.createElement('dialog'); mapPanel.id = 'map-library'; mapPanel.setAttribute('aria-label','Select map');
  const mapTitle = document.createElement('h1'); mapTitle.textContent = 'MAPS'; mapPanel.append(mapTitle);
  for (const map of maps) {
    const button = document.createElement('button'); button.textContent = map.name;
    button.setAttribute('aria-label',`Play ${map.name}`);
    button.onclick = () => globalThis.skateSelectMap(map.name); mapPanel.append(button);
  }
  const mapBack = document.createElement('button'); mapBack.textContent = 'Back'; mapPanel.append(mapBack);
  for (const type of ['keydown','keyup','pointerdown','pointerup']) mapPanel.addEventListener(type,e => e.stopPropagation());
  document.body.append(mapPanel);
  const panel = document.createElement('dialog'); panel.id = 'custom-models'; panel.setAttribute('aria-label','Custom models');
  const title = document.createElement('h1'); title.textContent = 'CUSTOM MODELS';
  const label = document.createElement('label'); label.htmlFor = 'character'; label.textContent = 'Character';
  const picker = document.createElement('select'); picker.id = 'character';
  picker.add(new Option('Stock skater','stock',false,!selected));
  for (const group of ['Custom characters','Hit & Run']) {
    const options = document.createElement('optgroup'); options.label = group;
    for (const character of library.filter(c => (c.group ?? 'Custom characters') === group))
      options.append(new Option(character.name,character.id,false,character === selected));
    picker.append(options);
  }
  const equip = document.createElement('button'); equip.textContent = 'Equip character';
  const back = document.createElement('button'); back.textContent = 'Back';
  const note = document.createElement('p'); note.textContent = 'Equipping restarts the selected map.';
  const credits = document.createElement('a'); credits.textContent = 'Character credits'; credits.href = 'characters/CREDITS.txt'; credits.target = '_blank';
  const gallery = document.createElement('section'); gallery.id = 'character-gallery';
  gallery.setAttribute('aria-label','All custom character models');
  const search = document.createElement('input'); search.type='search'; search.placeholder='Find a character'; search.setAttribute('aria-label','Find a character');
  const galleryTitle = document.createElement('h2'); galleryTitle.textContent = 'Character library';
  for (const group of ['Custom characters','Hit & Run']) {
    const heading = document.createElement('h2'); heading.textContent=group; heading.className='character-group'; gallery.append(heading);
    for (const character of library.filter(c => (c.group ?? 'Custom characters') === group)) {
    const card = document.createElement('article');
    const name = document.createElement('h3'); name.textContent = character.name;
    const choose = document.createElement('button'); choose.textContent = character.id === current ? 'Equipped' : 'Equip';
    choose.setAttribute('aria-label',`Equip ${character.name}`); choose.disabled = character.id === current;
    choose.onclick = () => { picker.value = character.id; equip.click(); };
    const model = document.createElement('a'); model.href = character.file; model.textContent = 'Download model'; model.download = `${character.id}.glb`;
    card.dataset.name=character.name.toLowerCase(); card.append(name,choose,model); gallery.append(card);
    }
  }
  search.oninput=()=> { for(const card of gallery.querySelectorAll('article')) card.hidden=!card.dataset.name.includes(search.value.trim().toLowerCase()); };
  panel.append(title,label,picker,equip,back,galleryTitle,search,gallery,note,credits);
  for (const type of ['keydown','keyup','pointerdown','pointerup']) panel.addEventListener(type,e => e.stopPropagation()); document.body.append(panel);
  const css = document.createElement('style'); css.textContent = `
    #custom-models-entry,#maps-entry { position:fixed; z-index:6; left:calc(50% - min(280px,47.5vw) + 18px);
      top:calc(50% + 121px); width:calc(min(560px,95vw) - 36px); height:28px;
      padding:3px; text-align:left; border:0; border-radius:5px; color:#d9e8f2; background:#141c26;
      font:18px/22px monospace; }
    #custom-models-entry:hover,#custom-models-entry:focus-visible { outline:2px solid #66d9d9; outline-offset:-2px; }
    #maps-entry { top:calc(50% - 71px); display:flex; justify-content:space-between; padding-right:24px; }
    #custom-models-entry[hidden],#maps-entry[hidden] { display:none; }
    #custom-models,#map-library { padding:24px; width:min(512px,calc(100vw - 64px)); max-height:calc(100dvh - 64px); overflow:auto;
      color:#d9e8f2; background:#09101a; border:0; border-radius:12px; font:16px/1.5 monospace; }
    #custom-models::backdrop { background:#040609ed; }
    #map-library::backdrop { background:#040609ed; }
    #map-library button { display:block; width:100%; text-align:left; margin:8px 0; padding:12px; color:#d9e8f2; background:#141c26; border:1px solid #29384a; font:18px monospace; cursor:pointer; }
    #map-library button:hover { background:#194c57; }
    #custom-models h1 { font:30px monospace; margin:0 0 24px; }
    #custom-models label { display:block; margin-bottom:8px; }
    #custom-models select { width:100%; padding:12px; font:16px monospace; background:#141c26; color:white; }
    #custom-models button { font:16px monospace; padding:10px 16px; margin:20px 12px 0 0; background:#194c57; }
    #custom-models p { font-size:14px; color:#a6bfcc; }
    #character-gallery { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    #character-gallery .character-group { grid-column:1/-1; margin:16px 0 0; }
    #character-gallery article[hidden] { display:none; }
    #custom-models input[type=search] { box-sizing:border-box; width:100%; padding:12px; margin:0 0 12px; font:16px monospace; color:white; background:#141c26; border:1px solid #29384a; }
    #character-gallery article { background:#141c26; padding:12px; border:1px solid #29384a; border-radius:6px; }
    #character-gallery h3 { font-size:16px; margin:0 0 8px; }
    #character-gallery button { margin:0 0 12px; }
    #character-gallery a { display:block; font-size:14px; }
    #character-gallery button:disabled { opacity:.6; cursor:default; }
    @media(max-width:480px) { #character-gallery { grid-template-columns:1fr; } }
    #custom-models a { color:#66d9d9; }
  `; document.head.append(css);
  const artStyle = document.createElement('style');
  artStyle.textContent = `
    #custom-models,#map-library { background:linear-gradient(115deg,#071923ee,#122f40f5),url('./assets/reference-ui/noise.png'); border-color:#40b9ee; }
    #custom-models h1,#map-library h1 { display:flex;align-items:center;gap:15px; }
    #custom-models h1::before,#map-library h1::before { content:'';display:block;width:40px;height:40px;background:url('./assets/reference-ui/skate.png') center/contain no-repeat; }
    #map-library h1::before { background-image:url('./assets/reference-ui/world.png'); }
    #custom-models button:hover,#map-library button:hover { background:#163f54; border-color:#38c3ff; }
    #character-gallery article { background:#071723; }
    #custom-models-entry::before { content:'';display:inline-block;width:20px;height:20px;background:url('./assets/reference-ui/wrench.png') center/contain no-repeat;vertical-align:middle;margin-right:8px; }
    #maps-entry span:first-child::before { content:'';display:inline-block;width:22px;height:22px;background:url('./assets/reference-ui/world.png') center/contain no-repeat;vertical-align:middle;margin-right:8px; }
  `;document.head.append(artStyle);
  let nativeOpen = true, submenu = false, row = 0, ready = false;
  const update = () => { entry.hidden = mapEntry.hidden = !ready || !nativeOpen || submenu || panel.open || mapPanel.open; };
  const originalLog = console.log.bind(console);
  console.log = (...args) => {
    originalLog(...args);
    const state = args.find(value => typeof value === 'string' && value.startsWith('REPORT_META state='));
    if (state) { nativeOpen = state.includes('paused:true'); update(); }
  };
  const open = () => { if (!panel.open) panel.showModal(); update(); };
  const openMaps = () => { if (!mapPanel.open) mapPanel.showModal(); update(); };
  const closeMaps = () => { mapPanel.close(); update(); canvas.focus(); };
  mapEntry.onclick = openMaps; mapBack.onclick = closeMaps;
  for (const event of ['pointerdown','pointerup','click']) mapEntry.addEventListener(event,e => e.stopPropagation());
  mapPanel.addEventListener('cancel',e => { e.preventDefault(); closeMaps(); });
  const close = () => { panel.close(); update(); canvas.focus(); };
  // Handle replacement rows before the engine's window input listeners.
  for (const type of ['pointerdown','pointerup','mousedown','mouseup','click']) {
    addEventListener(type,e => {
      if (entry.contains(e.target) || mapEntry.contains(e.target)) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (type==='pointerdown' || type==='click') {
          if (entry.contains(e.target)) open(); else openMaps();
        }
      } else if ((panel.open || mapPanel.open) && type!=='click') e.stopImmediatePropagation();
    },true);
  }
  entry.onclick = open; back.onclick = close;
  for (const event of ['pointerdown','pointerup','click']) entry.addEventListener(event,e => e.stopPropagation());
  panel.addEventListener('cancel',e => { e.preventDefault(); close(); });
  equip.onclick = () => {
    if (picker.value === current) { close(); return; }
    try { localStorage.setItem('springfield-character',picker.value); } catch {}
    const url = new URL(location.href); url.searchParams.set('character',picker.value);
    location.href = url.toString();
  };
  addEventListener('keydown',e => {
    if (panel.open || mapPanel.open) {
      e.stopImmediatePropagation();
      if (e.key==='Escape') { e.preventDefault(); if (panel.open) close(); else closeMaps(); }
      return;
    }
    if (e.key === 'Escape' && !e.repeat) {
      if (submenu) submenu = false; else nativeOpen = !nativeOpen;
      update();
    } else if (nativeOpen && !submenu && e.key === 'ArrowDown') row = (row+1)%17;
    else if (nativeOpen && !submenu && e.key === 'ArrowUp') row = (row+16)%17;
    else if (nativeOpen && !submenu && ['Enter',' ','ArrowLeft','ArrowRight'].includes(e.key)) {
      if (row === 6) { e.preventDefault(); e.stopImmediatePropagation(); openMaps(); }
      else if (row === 12) { e.preventDefault(); e.stopImmediatePropagation(); open(); }
      else if (row === 8) { nativeOpen = false; update(); }
      else if ([10,11,13,14,15,16].includes(row)) { submenu = true; update(); }
    }
  },true);
  addEventListener('keyup',e => { if (panel.open || mapPanel.open) e.stopImmediatePropagation(); },true);
  // Route the complete original Custom models row to the imported library.
  canvas.addEventListener('pointerdown',e => {
    if (!nativeOpen || submenu || panel.open || mapPanel.open) return;
    const y = e.clientY-(innerHeight/2-263);
    const clicked = Math.floor(y/32);
    if (clicked>=0 && clicked<17 && Math.abs(e.clientX-innerWidth/2)<262) {
      row = clicked;
      if (row===6) { e.preventDefault(); e.stopImmediatePropagation(); openMaps(); return; }
      if (row===12) { e.preventDefault(); e.stopImmediatePropagation(); open(); return; }
      if (row===8) nativeOpen = false;
      else if ([10,11,13,14,15,16].includes(row)) submenu = true;
      update();
    }
  },true);
  // Start opens the same native menu for controllers. A activates its existing
  // Custom models row; the browser panel supplies the imported library.
  let lastStart=false,lastA=false,lastDown=false,lastUp=false;
  function pads() {
    const controllers=[...navigator.getGamepads()].filter(Boolean);
    const start=controllers.some(p=>p.buttons[9]?.pressed), a=controllers.some(p=>p.buttons[0]?.pressed);
    const down=controllers.some(p=>p.buttons[13]?.pressed), up=controllers.some(p=>p.buttons[12]?.pressed);
    if (ready && start && !lastStart) { if (panel.open) close(); else { nativeOpen=!nativeOpen; update(); } }
    if (nativeOpen && !submenu) {
      if (down && !lastDown) row=(row+1)%17;
      if (up && !lastUp) row=(row+16)%17;
      if (a && !lastA && row===12) open();
    }
    lastStart=start;lastA=a;lastDown=down;lastUp=up;requestAnimationFrame(pads);
  }
  requestAnimationFrame(pads);
  globalThis.skateMenuReady = () => { ready=true; update(); };
  return selected;
}

export function replacePackedSkater(core, model) {
  const view = new DataView(core.buffer, core.byteOffset, core.byteLength);
  const decoder = new TextDecoder();
  let at = 12, found = false;
  const chunks = [core.subarray(0, 12)];
  for (let i = 0; i < view.getUint32(8, true); i++) {
    const start = at;
    const n = view.getUint32(at, true); at += 4;
    const name = decoder.decode(core.subarray(at, at + n)); at += n;
    const sizeAt = at;
    const size = Number(view.getBigUint64(at, true)); at += 8;
    if (name === 'assets/private/skater.glb') {
      chunks.push(core.subarray(start, sizeAt));
      const length = new Uint8Array(8);
      new DataView(length.buffer).setBigUint64(0, BigInt(model.length), true);
      chunks.push(length, model); found = true;
    } else chunks.push(core.subarray(start, at + size));
    at += size;
  }
  if (!found || at !== core.length) throw new Error('Invalid core pack: skater replacement failed');
  const output = new Uint8Array(chunks.reduce((n, chunk) => n + chunk.length, 0));
  at = 0;
  for (const chunk of chunks) { output.set(chunk, at); at += chunk.length; }
  return output;
}

export async function equipCharacter(core, selected, status) {
  if (!selected) return core;
  status(`Equipping ${selected.name}...`);
  const response = await fetch(`${selected.file}?v=${selected.hash}`, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Cannot load ${selected.name}: HTTP ${response.status}`);
  const model = new Uint8Array(await response.arrayBuffer());
  if (model.length !== selected.size) throw new Error('Character download size does not match the library');
  return replacePackedSkater(core, model);
}
