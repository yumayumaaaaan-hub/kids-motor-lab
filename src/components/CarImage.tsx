import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { CarImageDisplay, CarImageDisplayContext } from '../types/carImageDisplay';
import './CarImage.css';

type CarImageProps = {
  imagePath: string;
  carName: string;
  manufacturer?: string;
  className?: string;
  variant?: 'default' | 'silhouette';
  showPlaceholderDetails?: boolean;
  display?: CarImageDisplay;
  displayContext?: CarImageDisplayContext;
  /** debug=1：表示状態のプレビュー */
  previewState?: 'loading' | 'error' | 'normal' | null;
  /** 展示台画像を使う場合は CSS 影を非表示 */
  hideShadow?: boolean;
};

const PLACEHOLDER_PATH = '/cars/placeholder.svg';
const failedPaths = new Set<string>();

function CarSilhouetteSvg() {
  return (
    <svg viewBox="0 0 120 60" className="car-silhouette" aria-hidden="true">
      <rect x="8" y="28" width="104" height="22" rx="10" fill="#6b8cff" />
      <path d="M22 28 L38 14 H82 L98 28 Z" fill="#4a72e8" />
      <circle cx="32" cy="50" r="9" fill="#30456f" />
      <circle cx="88" cy="50" r="9" fill="#30456f" />
      <circle cx="32" cy="50" r="4" fill="#eef3ff" />
      <circle cx="88" cy="50" r="4" fill="#eef3ff" />
    </svg>
  );
}

function buildImageStyle(display?: CarImageDisplay): CSSProperties {
  if (!display) {
    return { objectPosition: 'center' };
  }

  const scale = display.scale ?? 1;
  const offsetX = display.offsetX ?? 0;
  const offsetY = display.offsetY ?? 0;

  return {
    objectPosition: display.objectPosition ?? 'center',
    transform:
      scale !== 1 || offsetX !== 0 || offsetY !== 0
        ? `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`
        : undefined,
  };
}

/** 車の画像（読み込み・エラー時もレイアウトを維持） */
export function CarImage({
  imagePath,
  carName,
  manufacturer,
  className = '',
  variant = 'default',
  showPlaceholderDetails = true,
  display,
  previewState = null,
  hideShadow = false,
}: CarImageProps) {
  const isSilhouette = variant === 'silhouette';
  const imgRef = useRef<HTMLImageElement>(null);
  const [activeSrc, setActiveSrc] = useState(imagePath);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(() => {
    if (previewState === 'loading') {
      return 'loading';
    }
    if (previewState === 'error') {
      return 'error';
    }
    if (previewState === 'normal') {
      return 'loaded';
    }
    return failedPaths.has(imagePath) ? 'error' : 'loading';
  });

  const handleLoad = () => {
    failedPaths.delete(imagePath);
    setLoadState('loaded');
  };

  const handleError = () => {
    // JPG が読めないときは同じ番号の SVG を試す（nenchu-car-get と同じ）
    if (/\.jpg$/i.test(activeSrc)) {
      const svgPath = activeSrc.replace(/\.jpg$/i, '.svg');
      if (svgPath !== activeSrc) {
        setActiveSrc(svgPath);
        setLoadState('loading');
        return;
      }
    }

    // SVG も無いときは共通プレースホルダー
    if (activeSrc !== PLACEHOLDER_PATH) {
      setActiveSrc(PLACEHOLDER_PATH);
      setLoadState('loading');
      return;
    }

    failedPaths.add(imagePath);
    setLoadState('error');
    console.warn(`[CarImage] 画像を読み込めません: ${imagePath}`);
  };

  useEffect(() => {
    setActiveSrc(imagePath);
    failedPaths.delete(imagePath);

    if (previewState === 'loading') {
      setLoadState('loading');
      return;
    }
    if (previewState === 'error') {
      setLoadState('error');
      return;
    }
    if (previewState === 'normal') {
      setLoadState('loaded');
      return;
    }

    setLoadState('loading');
  }, [imagePath, previewState]);

  // ブラウザキャッシュ済み画像は onLoad が発火しないことがある
  useEffect(() => {
    const img = imgRef.current;
    if (!img || previewState) {
      return;
    }
    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    }
  }, [activeSrc, previewState]);

  const imageStyle = useMemo(() => buildImageStyle(display), [display]);
  const showPlaceholder = loadState === 'error';
  const showSkeleton = loadState === 'loading';

  if (showPlaceholder) {
    return (
      <div
        className={`car-image-frame car-image-placeholder ${isSilhouette ? 'car-image-placeholder--silhouette' : ''} ${className}`}
        aria-label={`${carName}の画像`}
      >
        <CarSilhouetteSvg />
        {showPlaceholderDetails && (
          <div className="car-image-placeholder-info">
            {manufacturer && (
              <p className="car-image-placeholder-maker">{manufacturer}</p>
            )}
            <p className="car-image-placeholder-name">{carName}</p>
            <p className="car-image-placeholder-note">しゃしんは じゅんび中</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`car-image-frame ${className}`}>
      {!isSilhouette && !hideShadow && <div className="car-image-shadow" aria-hidden="true" />}
      {showSkeleton && (
        <div className="car-image-skeleton" aria-hidden="true">
          <CarSilhouetteSvg />
        </div>
      )}
      <img
        ref={imgRef}
        src={activeSrc}
        alt={carName}
        decoding="async"
        loading="eager"
        onLoad={handleLoad}
        onError={handleError}
        className={`car-image ${loadState === 'loaded' ? 'car-image--loaded' : ''} ${isSilhouette ? 'car-image--silhouette' : ''}`}
        style={imageStyle}
      />
    </div>
  );
}

export { CarSilhouetteSvg };
