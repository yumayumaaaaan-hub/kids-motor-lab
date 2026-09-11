import type { Point, ReferenceCharacter, ReferenceStroke } from '../types/strokeData';
import { fetchWithTimeout } from './fetchWithTimeout';

const CACHE_VERSION = 4;
const cache = new Map<string, ReferenceCharacter>();

/** 2点間の距離 */
function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/** SVG座標を0〜1へ正規化 */
function normalizePoint(
  x: number,
  y: number,
  viewBoxWidth: number,
  viewBoxHeight: number,
): Point {
  return {
    x: x / viewBoxWidth,
    y: y / viewBoxHeight,
  };
}

/** パスを等間隔で点列化 */
function samplePath(path: SVGPathElement, sampleCount: number): Point[] {
  const totalLength = path.getTotalLength();
  if (totalLength <= 0) {
    return [];
  }

  const points: Point[] = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const length = (totalLength * index) / Math.max(sampleCount - 1, 1);
    const point = path.getPointAtLength(length);
    points.push({ x: point.x, y: point.y });
  }

  return points;
}

/** clipPath内の点だけ残す */
function filterPointsInsideClip(
  points: Point[],
  clipPath: SVGPathElement | null,
): Point[] {
  if (!clipPath || points.length === 0) {
    return points;
  }

  return points.filter((point) =>
    clipPath.isPointInFill(new DOMPoint(point.x, point.y)),
  );
}

/** 方向ベクトルを正規化 */
function normalizeVector(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y);
  if (length <= 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / length, y: vector.y / length };
}

/** clip-path="url(#id)" から影パスを取得 */
function resolveClipShadowPath(
  clipPathValue: string | null,
  doc: Document | null,
): SVGPathElement | null {
  if (!clipPathValue || !doc) {
    return null;
  }

  const match = clipPathValue.match(/url\(#([^)]+)\)/);
  if (!match) {
    return null;
  }

  const clipElement = doc.getElementById(match[1]);
  if (!clipElement) {
    return null;
  }

  const useElement = clipElement.querySelector('use');
  const href =
    useElement?.getAttribute('href') ??
    useElement?.getAttributeNS('http://www.w3.org/1999/xlink', 'href');

  if (!href?.startsWith('#')) {
    return null;
  }

  const shadow = doc.getElementById(href.slice(1));
  return shadow instanceof SVGPathElement ? shadow : null;
}

/** 書き順番号の位置（パス先頭付近で、文字の左上に近い点を選ぶ） */
function getStrokeLabelPoint(
  path: SVGPathElement,
  clipShadow: SVGPathElement | null,
  viewBoxWidth: number,
  viewBoxHeight: number,
): Point {
  const totalLength = path.getTotalLength();
  if (totalLength <= 0) {
    return { x: 0.5, y: 0.5 };
  }

  let firstInside: Point | null = null;
  const earlyCandidates: Point[] = [];
  const steps = 48;

  for (let index = 0; index <= steps; index += 1) {
    const length = (totalLength * index) / steps;
    const point = path.getPointAtLength(length);
    const inside =
      !clipShadow ||
      clipShadow.isPointInFill(new DOMPoint(point.x, point.y));

    if (!inside) {
      continue;
    }

    const normalized = normalizePoint(
      point.x,
      point.y,
      viewBoxWidth,
      viewBoxHeight,
    );

    if (!firstInside) {
      firstInside = normalized;
    }

    if (length <= totalLength * 0.3) {
      earlyCandidates.push(normalized);
    }
  }

  if (earlyCandidates.length > 0) {
    return earlyCandidates.reduce((best, candidate) => {
      if (candidate.y < best.y - 0.001) {
        return candidate;
      }
      if (
        Math.abs(candidate.y - best.y) <= 0.001 &&
        candidate.x < best.x
      ) {
        return candidate;
      }
      return best;
    });
  }

  if (firstInside) {
    return firstInside;
  }

  const start = path.getPointAtLength(0);
  return normalizePoint(start.x, start.y, viewBoxWidth, viewBoxHeight);
}

/** 1画分のパス要素群を点列へ変換 */
function pathsToStroke(
  pathEntries: Array<{ path: SVGPathElement; clipShadow: SVGPathElement | null }>,
  viewBoxWidth: number,
  viewBoxHeight: number,
  sampleCount: number,
): ReferenceStroke | null {
  const segments: Point[][] = [];

  for (const entry of pathEntries) {
    const sampled = samplePath(entry.path, sampleCount);
    const clipped = filterPointsInsideClip(sampled, entry.clipShadow);

    if (clipped.length >= 2) {
      segments.push(
        clipped.map((point) =>
          normalizePoint(point.x, point.y, viewBoxWidth, viewBoxHeight),
        ),
      );
    }
  }

  if (segments.length === 0) {
    return null;
  }

  const points = segments.flat();
  const start = segments[0][0];
  const end = segments[segments.length - 1][segments[segments.length - 1].length - 1];
  const direction = normalizeVector({
    x: end.x - start.x,
    y: end.y - start.y,
  });
  const labelPoint = getStrokeLabelPoint(
    pathEntries[0].path,
    pathEntries[0].clipShadow,
    viewBoxWidth,
    viewBoxHeight,
  );

  return { segments, points, start, end, labelPoint, direction };
}

/** g[data-strokesvg="strokes"] から画データを抽出 */
function parseStrokeSvg(svgText: string): ReferenceCharacter {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    throw new Error('SVGが見つかりません');
  }

  const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [
    0, 0, 1024, 1024,
  ];
  const viewBoxWidth = viewBox[2] || 1024;
  const viewBoxHeight = viewBox[3] || 1024;

  const strokesGroup = svg.querySelector('[data-strokesvg="strokes"]');
  if (!strokesGroup) {
    throw new Error('strokes グループが見つかりません');
  }

  const measurementHost = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  measurementHost.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  measurementHost.style.position = 'absolute';
  measurementHost.style.width = '0';
  measurementHost.style.height = '0';
  measurementHost.style.overflow = 'hidden';
  document.body.appendChild(measurementHost);

  const defs = svg.querySelector('defs');
  if (defs) {
    measurementHost.appendChild(defs.cloneNode(true));
  }

  const shadowHost = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const shadowsGroup = svg.querySelector('[data-strokesvg="shadows"]');
  if (shadowsGroup) {
    shadowHost.appendChild(shadowsGroup.cloneNode(true));
  }
  measurementHost.appendChild(shadowHost);

  const strokes: ReferenceStroke[] = [];

  try {
    for (const child of Array.from(strokesGroup.children)) {
      const pathEntries: Array<{
        path: SVGPathElement;
        clipShadow: SVGPathElement | null;
      }> = [];

      const collectPath = (pathElement: Element) => {
        const clonedPath = pathElement.cloneNode(true) as SVGPathElement;
        measurementHost.appendChild(clonedPath);

        const clipShadow = resolveClipShadowPath(
          clonedPath.getAttribute('clip-path'),
          measurementHost.ownerDocument,
        );

        pathEntries.push({ path: clonedPath, clipShadow });
      };

      if (child.tagName.toLowerCase() === 'path') {
        collectPath(child);
      } else if (child.tagName.toLowerCase() === 'g') {
        for (const pathElement of Array.from(child.querySelectorAll(':scope > path'))) {
          collectPath(pathElement);
        }
      }

      const stroke = pathsToStroke(
        pathEntries,
        viewBoxWidth,
        viewBoxHeight,
        48,
      );

      if (stroke) {
        strokes.push(stroke);
      }

      for (const entry of pathEntries) {
        measurementHost.removeChild(entry.path);
      }
    }
  } finally {
    document.body.removeChild(measurementHost);
  }

  return {
    viewBoxWidth,
    viewBoxHeight,
    strokes,
  };
}

/** お手本SVGを読み込む（採点用・キャッシュあり） */
export async function loadReferenceCharacter(
  svgPath: string,
): Promise<ReferenceCharacter> {
  const cacheKey = `${svgPath}?v=${CACHE_VERSION}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetchWithTimeout(svgPath);
  if (!response.ok) {
    throw new Error(`SVGの読み込みに失敗: ${svgPath}`);
  }

  const svgText = await response.text();
  const reference = parseStrokeSvg(svgText);
  cache.set(cacheKey, reference);
  return reference;
}

/** 2点列間の平均距離（a→b） */
export function averageMinDistance(from: Point[], to: Point[]): number {
  if (from.length === 0 || to.length === 0) {
    return 1;
  }

  let total = 0;
  for (const point of from) {
    let minDistance = Infinity;
    for (const target of to) {
      minDistance = Math.min(minDistance, distance(point, target));
    }
    total += minDistance;
  }

  return total / from.length;
}

/** 双方向の平均距離 */
export function bidirectionalDistance(a: Point[], b: Point[]): number {
  return (averageMinDistance(a, b) + averageMinDistance(b, a)) / 2;
}

/** 線の全長 */
export function strokeLength(stroke: Point[]): number {
  let total = 0;
  for (let index = 1; index < stroke.length; index += 1) {
    total += distance(stroke[index - 1], stroke[index]);
  }
  return total;
}

/** お手本1画を再サンプリング（パス間はつながない） */
export function resampleReferenceStroke(
  stroke: ReferenceStroke,
  sampleCount: number,
): Point[] {
  if (stroke.segments.length === 0) {
    return stroke.points;
  }

  const lengths = stroke.segments.map((segment) => strokeLength(segment));
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);

  if (totalLength <= 0) {
    return stroke.points;
  }

  const result: Point[] = [];
  for (let index = 0; index < stroke.segments.length; index += 1) {
    const segmentSampleCount = Math.max(
      2,
      Math.round((sampleCount * lengths[index]) / totalLength),
    );
    result.push(...resamplePolyline(stroke.segments[index], segmentSampleCount));
  }

  return result;
}

/** 折れ線を等間隔で再サンプリング */
function resamplePolyline(stroke: Point[], sampleCount: number): Point[] {
  if (stroke.length === 0) {
    return [];
  }

  if (stroke.length === 1) {
    return [{ ...stroke[0] }];
  }

  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let index = 1; index < stroke.length; index += 1) {
    const length = distance(stroke[index - 1], stroke[index]);
    segmentLengths.push(length);
    totalLength += length;
  }

  if (totalLength <= 0) {
    return [{ ...stroke[0] }];
  }

  const result: Point[] = [];
  let segmentIndex = 0;
  let segmentStart = 0;

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const targetLength =
      (totalLength * sampleIndex) / Math.max(sampleCount - 1, 1);

    while (
      segmentIndex < segmentLengths.length &&
      segmentStart + segmentLengths[segmentIndex] < targetLength
    ) {
      segmentStart += segmentLengths[segmentIndex];
      segmentIndex += 1;
    }

    if (segmentIndex >= segmentLengths.length) {
      result.push({ ...stroke[stroke.length - 1] });
      continue;
    }

    const segmentProgress =
      (targetLength - segmentStart) / segmentLengths[segmentIndex];
    const from = stroke[segmentIndex];
    const to = stroke[segmentIndex + 1];

    result.push({
      x: from.x + (to.x - from.x) * segmentProgress,
      y: from.y + (to.y - from.y) * segmentProgress,
    });
  }

  return result;
}
