# crazy-tiles — projekt Phaser 2D

## Identyfikatory

- **Repo:** https://github.com/GrzegorzKossowski/crazy-tiles
- **Live (GitHub Pages):** https://grzegorzKossowski.github.io/crazy-tiles/
- **Katalog lokalny:** `c:\Users\Grzegorz.Kossowski\Projekty\_moje\tiles`

## Stack

| Warstwa      | Technologia                        |
|--------------|------------------------------------|
| Silnik gry   | Phaser 4.1.0 (linia Phaser 3)      |
| Bundler      | Vite 8 (rolldown)                  |
| Język        | Vanilla JS (ESM), bez TypeScript   |
| Testy        | Vitest 4 + jsdom                   |
| Deploy       | GitHub Actions → GitHub Pages      |

## Komendy

```bash
npm run dev          # dev server na localhost:3000 (HMR, otwiera przeglądarkę)
npm test             # vitest run (jednorazowo)
npm run test:watch   # vitest w trybie watch
npm run build        # vite build → dist/
npm run preview      # podgląd builda lokalnie
```

## Workflow (OBOWIĄZKOWY)

Po każdym ukończonym tasku:
1. `npm test` — wszystkie testy muszą przejść
2. `git add . && git commit -m "..." && git push`
3. GitHub Actions automatycznie: test → build → deploy na Pages

**Nie pushować jeśli testy nie przechodzą.**

## Struktura projektu

```
tiles/
├── public/assets/          ← obrazki, tilemaps, audio (serwowane statycznie)
└── src/
    ├── main.js             ← Phaser.Game config (entry point)
    ├── config/
    │   ├── gameConfig.js   ← stałe: GAME_WIDTH, GAME_HEIGHT, TILE_SIZE
    │   └── gameConfig.test.js
    └── scenes/
        ├── BootScene.js    ← start → PreloadScene
        ├── PreloadScene.js ← pasek ładowania, load assetów → GameScene
        └── GameScene.js    ← główna scena gry
```

## Konwencje

- `GAME_WIDTH` i `GAME_HEIGHT` **muszą być podzielne przez `TILE_SIZE`** (aktualnie 800×576, TILE_SIZE=32)
- Assety do `public/assets/` — ładowane w PreloadScene przez `this.load.*`
- Każdy plik sceny importuje Phaser osobno: `import Phaser from 'phaser'`
- Testy tylko dla czystego JS (logika gry, config, utilities) — sceny Phasera nie są testowane jednostkowo (wymagają WebGL)
- Nowe sceny → do `src/scenes/`, rejestrowane w tablicy `scene` w `src/main.js`

## Aktualny status

- [x] Setup Vite + Phaser 4
- [x] Struktura scen (Boot → Preload → Game)
- [x] Placeholder: szachownica kafelków + gracz (strzałki/WASD)
- [x] Vitest + coverage
- [x] GitHub Actions: test → build → deploy
- [ ] Właściwa logika gry (szczegóły TBD)
