/**
 * ゲームデータ一括生成
 * - strokesvg から清音46文字の SVG を取得
 * - nenchu-car-get から 200 台分の cars.ts を生成（ひらがな3文字は車IDでランダム）
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const strokesDir = join(root, 'public', 'strokes', 'hiragana');
const carsDataPath = join(root, '..', 'nenchu-car-get', 'cars-data.js');
const carsJapanDataPath = join(root, '..', 'nenchu-car-get', 'cars-data-japan.js');
const hiraganaTsPath = join(root, 'src', 'data', 'hiraganaCharacters.ts');
const carsTsPath = join(root, 'src', 'data', 'cars.ts');

const STROKESVG_BASE =
  'https://raw.githubusercontent.com/zhengkyl/strokesvg/main/dist/hiragana';

/** 清音46文字（小学で習う基本のひらがな） */
const GOJUON = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function countStrokes(svgText) {
  const marker = 'data-strokesvg="strokes"';
  const idx = svgText.indexOf(marker);
  if (idx === -1) {
    return 1;
  }
  const section = svgText.slice(idx);
  const styleMatches = section.match(/style="--i:\d+"/g);
  if (styleMatches?.length) {
    return styleMatches.length;
  }
  const groupSlice = section.split('</g>')[0] ?? section;
  const pathCount = (groupSlice.match(/<path/g) ?? []).length;
  return pathCount > 0 ? pathCount : 1;
}

async function downloadStroke(character) {
  const url = `${STROKESVG_BASE}/${encodeURIComponent(character)}.svg`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SVG 取得失敗: ${character} (${response.status})`);
  }
  return response.text();
}

function loadNenchuCars() {
  const source = readFileSync(carsDataPath, 'utf8');
  const batch1 = new Function(`${source}; return CARS;`)();
  const sourceJapan = readFileSync(carsJapanDataPath, 'utf8');
  const batch2 = new Function(`${sourceJapan}; return CARS_JAPAN;`)();
  return [...batch1, ...batch2];
}

function pickRandomCharacters(carId, pool, count = 3) {
  const rand = mulberry32(carId * 9973 + 42);
  const picked = [];
  const available = [...pool];

  while (picked.length < count && available.length > 0) {
    const j = Math.floor(rand() * available.length);
    picked.push(available.splice(j, 1)[0]);
  }

  return picked;
}

function toCarId(maker, model) {
  return `${maker}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function padNenchuId(id) {
  return String(id).padStart(3, '0');
}

function buildHiraganaTs(entries) {
  const lines = entries.map(
    (entry) => `  {
    character: '${entry.character}',
    expectedStrokeCount: ${entry.expectedStrokeCount},
    strokeSvgPath: '/strokes/hiragana/${entry.fileName}',
  },`,
  );

  return `/** このファイルは scripts/generate-game-data.mjs で自動生成 */
export type HiraganaData = {
  character: string;
  expectedStrokeCount: number;
  strokeSvgPath: string;
};

/** 練習するひらがな一覧（清音46文字） */
export const hiraganaList: HiraganaData[] = [
${lines.join('\n')}
];

export type HiraganaCharacter = (typeof hiraganaList)[number]['character'];

/** 文字からデータを取得 */
export function getHiraganaData(character: string): HiraganaData | undefined {
  return hiraganaList.find((item) => item.character === character);
}
`;
}

function buildCarsTs(nenchuCars, characterSets) {
  const rows = nenchuCars.map((row, index) => {
    const imageFile = `${padNenchuId(row.id)}.jpg`;
    const chars = characterSets[index];
    const charLiteral = JSON.stringify(chars);
    const tier = row.id <= 100 ? 1 : 2;
    return `  {
    id: '${toCarId(row.maker, row.model)}',
    manufacturer: ${JSON.stringify(row.maker)},
    name: ${JSON.stringify(row.model)},
    requiredCharacters: ${charLiteral},
    requiredBlueprints: 3,
    imagePath: '/cars/${imageFile}',
    unlockOrder: ${index + 1},
    tier: ${tier},
    imageSource: 'nenchu-car-get/assets/cars/${imageFile}',
    imageCredit: 'Wikimedia Commons（nenchu-car-get 参照）',
    imageLicense: 'Creative Commons（Wikimedia Commons）',
  },`;
  });

  return `/** このファイルは scripts/generate-game-data.mjs で自動生成 */
import type { CarImageDisplaySettings } from '../types/carImageDisplay';

export type Car = {
  id: string;
  manufacturer: string;
  name: string;
  requiredCharacters: string[];
  imagePath: string;
  unlockOrder: number;
  /** 1=外国車100台 / 2=日本車100台（100台コンプリート後に解放） */
  tier?: 1 | 2;
  imageDisplay?: CarImageDisplaySettings;
  requiredBlueprints?: number;
  imageSource?: string;
  imageCredit?: string;
  imageLicense?: string;
};

/** nenchu-car-get の全200台（外国車1〜100 + 日本車101〜200） */
export const cars: Car[] = [
${rows.join('\n')}
];

/** 第1章（外国車）の台数 */
export const TIER1_CAR_COUNT = 100;

/** 第2章（日本車）の台数 */
export const TIER2_CAR_COUNT = 100;

/** 以前の1台目ID（v1→v2 進捗移行用） */
export const legacyFirstCarIds = ['toyota-gr-yaris', 'bmw-3-series'];

/** @deprecated activeCarId を使用 */
export const targetCar = cars[0];

/** ID から車を取得 */
export function getCarById(id: string): Car | undefined {
  return cars.find((car) => car.id === id);
}

/** unlockOrder 順にソート済み */
export function getCarsByUnlockOrder(): Car[] {
  return [...cars].sort((a, b) => a.unlockOrder - b.unlockOrder);
}
`;
}

async function main() {
  mkdirSync(strokesDir, { recursive: true });

  console.log('ひらがな SVG をダウンロード中…');
  const hiraganaEntries = [];

  for (const character of GOJUON) {
    const fileName = `${character}.svg`;
    const dest = join(strokesDir, fileName);
    let svgText;

    if (existsSync(dest)) {
      svgText = readFileSync(dest, 'utf8');
      process.stdout.write(`  skip ${character} (exists)\n`);
    } else {
      svgText = await downloadStroke(character);
      writeFileSync(dest, svgText, 'utf8');
      process.stdout.write(`  saved ${character}\n`);
    }

    hiraganaEntries.push({
      character,
      fileName,
      expectedStrokeCount: countStrokes(svgText),
    });
  }

  writeFileSync(hiraganaTsPath, buildHiraganaTs(hiraganaEntries), 'utf8');
  console.log(`\n生成: ${hiraganaTsPath} (${hiraganaEntries.length}文字)`);

  console.log('\n車データを生成中…');
  const nenchuCars = loadNenchuCars();
  const characterSets = nenchuCars.map((car) =>
    pickRandomCharacters(car.id, GOJUON, 3),
  );
  writeFileSync(carsTsPath, buildCarsTs(nenchuCars, characterSets), 'utf8');
  console.log(`生成: ${carsTsPath} (${nenchuCars.length}台)`);

  console.log('\n完了');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
