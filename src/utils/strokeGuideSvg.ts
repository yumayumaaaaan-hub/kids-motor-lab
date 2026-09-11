import {
  formatWritingViewBox,
  loadWritingViewBox,
  type WritingViewBox,
} from './writingViewBox';
import { fetchWithTimeout } from './fetchWithTimeout';

const svgTextCache = new Map<string, string>();

/** 表示用SVGテキストを読み込む */
export async function loadGuideSvgText(svgPath: string): Promise<string> {
  const cached = svgTextCache.get(svgPath);
  if (cached) {
    return cached;
  }

  const response = await fetchWithTimeout(svgPath);
  if (!response.ok) {
    throw new Error(`SVGの読み込みに失敗: ${svgPath}`);
  }

  const svgText = await response.text();
  svgTextCache.set(svgPath, svgText);
  return svgText;
}

/** IDの衝突を防ぐためプレフィックスを付ける */
function prefixSvgIds(svg: Element, prefix: string): void {
  const idMap = new Map<string, string>();

  svg.querySelectorAll('[id]').forEach((element) => {
    const oldId = element.getAttribute('id');
    if (!oldId) {
      return;
    }
    const newId = `${prefix}-${oldId}`;
    idMap.set(oldId, newId);
    element.setAttribute('id', newId);
  });

  const replaceIds = (value: string): string =>
    value.replace(/url\(#([^)]+)\)/g, (_, oldId: string) => {
      const mapped = idMap.get(oldId);
      return mapped ? `url(#${mapped})` : `url(#${oldId})`;
    }).replace(/#([0-9a-zA-Z_-]+)/g, (match, oldId: string) => {
      const mapped = idMap.get(oldId);
      return mapped ? `#${mapped}` : match;
    });

  svg.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (
        attribute.value.includes('#') ||
        attribute.name === 'href' ||
        attribute.name.endsWith('href')
      ) {
        element.setAttribute(attribute.name, replaceIds(attribute.value));
      }
    }
  });
}

type PrepareGuideSvgOptions = {
  helpMode: boolean;
  visibleStrokeCount: number;
};

/**
 * お手本表示用にSVGを加工する
 * shadows（塗り）をガイドとして表示し、strokes（中心線）は使わない
 */
export function prepareGuideSvg(
  svgText: string,
  prefix: string,
  { helpMode, visibleStrokeCount }: PrepareGuideSvgOptions,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    return svgText;
  }

  prefixSvgIds(svg, prefix);

  const shadows = svg.querySelector('[data-strokesvg="shadows"]');
  const strokes = svg.querySelector('[data-strokesvg="strokes"]');

  if (shadows) {
    shadows.setAttribute(
      'style',
      helpMode
        ? 'fill:rgba(120, 150, 220, 0.55)'
        : 'fill:rgba(180, 190, 210, 0.42)',
    );

    Array.from(shadows.children).forEach((child, index) => {
      const visible = index < visibleStrokeCount;
      child.setAttribute('opacity', visible ? '1' : '0');
      child.setAttribute('display', visible ? 'inline' : 'none');
    });
  }

  if (strokes) {
    strokes.setAttribute('display', 'none');
  }

  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  return svg.outerHTML;
}

/** 文字中央寄せの viewBox を適用した表示用 SVG */
export async function prepareGuideSvgForPath(
  svgPath: string,
  prefix: string,
  options: PrepareGuideSvgOptions,
  viewBox: WritingViewBox = {
    originalSize: 1024,
    minX: 0,
    minY: 0,
    size: 1024,
  },
): Promise<string> {
  const svgText = await loadGuideSvgText(svgPath);

  const markup = prepareGuideSvg(svgText, prefix, options);
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) {
    return markup;
  }

  svg.setAttribute('viewBox', formatWritingViewBox(viewBox));
  return svg.outerHTML;
}

export { loadWritingViewBox, type WritingViewBox };
