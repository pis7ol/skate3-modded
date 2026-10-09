# skate3 modded

[Play skate3](https://pis7ol.github.io/skatespringfield/)

The GitHub Pages build recovers the existing release assets from GitHub Pages, verifies each file against its SHA-256, then applies the loading screen and menu artwork in this repository. The former Sites asset source is no longer required.

The eight original skate maps are pinned in `map-files.json`, downloaded and verified during the build, and served alongside the Simpsons maps by GitHub Pages. `pack.json` is updated from those verified records so live changes on the original map host cannot break map loading in an already published release.

The previous audio is retained. New-version maps, clothing, multiplayer and Hall of Meat are not included because they require the newer engine and, for multiplayer, a lobby server.

Requires a WebGPU-capable browser. The first load takes longer; later sessions use cached assets.

This is an unofficial fan game. Original game artwork remains owned by EA / EA Black Box and its respective rights holders. Map and character credits are included in the game. Additional menu artwork came from https://skate.aaddpp.lol.
