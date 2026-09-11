import { loadGuideSvgText } from './strokeGuideSvg';

/** 採点座標（0〜1）の基準となる viewBox サイズ */
export type WritingViewBox = {
  originalSize: number;
  minX: number;
  minY: number;
  size: number;
};

const viewBoxCache = new Map<string, WritingViewBox>();

const DEFAULT_VIEW_BOX: WritingViewBox = {
  originalSize: 1024,
  minX: 0,
  minY: 0,
  size: 1024,
};

/** 影パス（path）の bounds をすべて合算 */
function measureShadowBounds(svg: SVGSVGElement): DOMRect {
  const paths = svg.querySelectorAll('[data-strokesvg="shadows"] path');
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  paths.forEach((node) => {
    const box = (node as SVGGraphicsElement).getBBox();
    if (box.width <= 0 || box.height <= 0) {
      return;
    }
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  });

  if (!Number.isFinite(minX)) {
    return (svg as SVGGraphicsElement).getBBox();
  }

  const width = maxX - minX;
  const height = maxY - minY;
  return new DOMRect(minX, minY, width, height);
}

/** 影パスの bounding box から、文字を中央に置く正方形 viewBox を作る */
export function computeWritingViewBoxFromSvg(
  svg: SVGSVGElement,
  paddingRatio = 0.12,
): WritingViewBox {
  const viewBoxParts = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [
    0, 0, 1024, 1024,
  ];
  const originalSize = viewBoxParts[2] || 1024;

  svg.setAttribute('width', String(originalSize));
  svg.setAttribute('height', String(originalSize));
  svg.setAttribute('overflow', 'visible');

  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;visibility:hidden';
  host.appendChild(svg);
  document.body.appendChild(host);

  let bbox: DOMRect;
  try {
    bbox = measureShadowBounds(svg);
  } finally {
    document.body.removeChild(host);
  }

  if (bbox.width <= 0 || bbox.height <= 0) {
    return { ...DEFAULT_VIEW_BOX, originalSize };
  }

  const pad = Math.max(bbox.width, bbox.height) * paddingRatio;
  const side = Math.max(bbox.width, bbox.height) + pad * 2;
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  return {
    originalSize,
    minX: centerX - side / 2,
    minY: centerY - side / 2,
    size: side,
  };
}

/** 表示用 viewBox 文字列 */
export function formatWritingViewBox(viewBox: WritingViewBox): string {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.size} ${viewBox.size}`;
}

/** 正規化座標（0〜1）→ viewBox 上の座標 */
export function normalizedToViewBoxPoint(
  point: { x: number; y: number },
  viewBox: WritingViewBox,
): { x: number; y: number } {
  return {
    x: point.x * viewBox.originalSize,
    y: point.y * viewBox.originalSize,
  };
}

/** viewBox 上の座標 → 正規化座標（0〜1） */
export function viewBoxPointToNormalized(
  x: number,
  y: number,
  viewBox: WritingViewBox,
): { x: number; y: number } {
  return {
    x: x / viewBox.originalSize,
    y: y / viewBox.originalSize,
  };
}

/** SVG パスから表示用 viewBox を読み込む（キャッシュあり） */
export async function loadWritingViewBox(
  svgPath: string,
): Promise<WritingViewBox> {
  const cached = viewBoxCache.get(svgPath);
  if (cached) {
    return cached;
  }

  try {
    const svgText = await loadGuideSvgText(svgPath);
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) {
      return DEFAULT_VIEW_BOX;
    }

    const viewBox = computeWritingViewBoxFromSvg(svg);
    viewBoxCache.set(svgPath, viewBox);
    return viewBox;
  } catch {
    return DEFAULT_VIEW_BOX;
  }
}

export { DEFAULT_VIEW_BOX };
