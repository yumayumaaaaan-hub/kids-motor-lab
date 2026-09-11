# Third-Party Notices

## strokesvg (hiragana SVG stroke data)

- **Source:** https://github.com/zhengkyl/strokesvg
- **Files used:**
  - `public/strokes/hiragana/あ.svg`
  - `public/strokes/hiragana/い.svg`
  - `public/strokes/hiragana/う.svg`
  - `public/strokes/hiragana/え.svg`
  - `public/strokes/hiragana/お.svg`
- **Origin path in repository:** `dist/hiragana/*.svg`
- **Basis font:** Klee One (Fontworks)
- **License:** SIL Open Font License 1.1 (OFL-1.1)
  - Repository README states stroke SVGs are based on Klee One, licensed under OFL-1.1.
  - See: https://openfontlicense.org/
- **Usage in this project:** Local copy for hiragana writing guides and stroke evaluation reference paths.

## Car images (nenchu-car-get / Wikimedia Commons)

- **List reference:** `../nenchu-car-get/cars-data.js` (ids 1–10 used in this project)
- **Local image paths:** `public/cars/001.jpg` … `public/cars/010.jpg`
- **Image source project:** `../nenchu-car-get/assets/cars/` (same filenames)
- **License:** Creative Commons via Wikimedia Commons (see `nenchu-car-get/car-image-urls.js` and download logs)
- **Copy script:** `scripts/copy-car-images.ps1` (run after images exist in nenchu-car-get)

## Klee One (indirect dependency via strokesvg)

- **Source:** https://github.com/fontworks-fonts/Klee
- **License:** SIL Open Font License 1.1 (OFL-1.1)
