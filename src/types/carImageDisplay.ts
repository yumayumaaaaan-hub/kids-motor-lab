import type { Car } from '../data/cars';

/** 車画像の表示位置調整（保存データには含めない） */
export type CarImageDisplay = {
  objectPosition?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
};

export type CarImageDisplayContext = 'default' | 'compact' | 'showcase';

export type CarImageDisplaySettings = CarImageDisplay & {
  compact?: CarImageDisplay;
  showcase?: CarImageDisplay;
};

/** 表示コンテキストに応じた調整値を取得 */
export function getCarImageDisplay(
  car: Car,
  context: CarImageDisplayContext = 'default',
): CarImageDisplay {
  const settings = car.imageDisplay;
  if (!settings) {
    return {};
  }

  if (context === 'compact' && settings.compact) {
    return { ...settings, ...settings.compact };
  }
  if (context === 'showcase' && settings.showcase) {
    return { ...settings, ...settings.showcase };
  }

  const { compact: _c, showcase: _s, ...base } = settings;
  return base;
}
