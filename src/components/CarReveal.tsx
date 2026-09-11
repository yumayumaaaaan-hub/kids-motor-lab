import { useEffect, useState } from 'react';
import type { Car } from '../data/cars';
import { getCarImageDisplay } from '../types/carImageDisplay';
import type { CarImageDisplayContext } from '../types/carImageDisplay';
import { CarImageFrame } from './art/CarImageFrame';
import { CarImage } from './CarImage';
import './CarReveal.css';
import './art/CarImageFrame.css';

type CarRevealProps = {
  car: Car;
  revealedPanels: number;
  totalPanels: number;
  variant?: 'default' | 'compact' | 'showcase';
  animateBuild?: boolean;
  imagePreviewState?: 'loading' | 'error' | 'normal' | null;
  locked?: boolean;
  /** 車完成演出（光線・スポットライト） */
  celebration?: boolean;
};

function toDisplayContext(
  variant: CarRevealProps['variant'],
): CarImageDisplayContext {
  if (variant === 'compact') return 'compact';
  if (variant === 'showcase') return 'showcase';
  return 'default';
}

function toFrameVariant(
  variant: CarRevealProps['variant'],
  celebration: boolean,
): 'compact' | 'garage' | 'showroom' | 'reward' {
  if (celebration) return 'reward';
  if (variant === 'compact') return 'compact';
  if (variant === 'showcase') return 'showroom';
  return 'garage';
}

/** 設計図枚数に応じて車を段階的に組み立て表示 */
export function CarReveal({
  car,
  revealedPanels,
  totalPanels,
  variant = 'default',
  animateBuild = false,
  imagePreviewState = null,
  locked = false,
  celebration = false,
}: CarRevealProps) {
  const [flashSegment, setFlashSegment] = useState<number | null>(null);
  const isCompact = variant === 'compact';
  const isShowcase = variant === 'showcase';
  const isComplete = revealedPanels >= totalPanels;
  const displayContext = toDisplayContext(variant);
  const display = getCarImageDisplay(car, displayContext);
  const carLabel = `${car.manufacturer} ${car.name}`;

  const frameVariant = toFrameVariant(variant, celebration);
  const frameStatus = locked ? 'locked' : isComplete ? 'completed' : 'active';

  useEffect(() => {
    if (!animateBuild || revealedPanels <= 0) return;
    const segment = revealedPanels - 1;
    setFlashSegment(segment);
    const timer = window.setTimeout(() => setFlashSegment(null), 700);
    return () => window.clearTimeout(timer);
  }, [animateBuild, revealedPanels]);

  const clipReveal = (() => {
    if (isComplete) return 'none';
    const pct = (revealedPanels / totalPanels) * 100;
    return `inset(0 ${100 - pct}% 0 0)`;
  })();

  return (
    <div
      className={`car-build ${isCompact ? 'car-build--compact' : ''} ${isShowcase ? 'car-build--showcase' : ''} ${isComplete ? 'car-build--complete' : ''} ${celebration ? 'car-build--celebration' : ''}`}
      aria-label={`${car.name} ${revealedPanels}/${totalPanels}枚 くみたて`}
    >
      <CarImageFrame
        variant={frameVariant}
        status={frameStatus}
        showSpotlight={celebration || (isShowcase && isComplete) || (frameStatus === 'completed' && !isCompact)}
        showRays={celebration}
        animateSpotlight={celebration}
        animateRays={celebration}
        className="car-build-frame"
      >
        <div className="car-build-stage">
          <div className="car-build-image-layer car-build-image-layer--base">
            <CarImage
              imagePath={car.imagePath}
              carName={carLabel}
              manufacturer={car.manufacturer}
              display={display}
              previewState={imagePreviewState}
              className="car-build-image"
              hideShadow
            />
          </div>

          {!isComplete && (
            <div
              className="car-build-image-layer car-build-image-layer--color"
              style={{ clipPath: clipReveal }}
            >
              <CarImage
                imagePath={car.imagePath}
                carName={carLabel}
                display={display}
                previewState={imagePreviewState}
                showPlaceholderDetails={false}
                className="car-build-image"
                hideShadow
              />
            </div>
          )}

          {!isComplete &&
            Array.from({ length: totalPanels }, (_, index) => {
              const isRevealed = index < revealedPanels;
              const left = `${(index / totalPanels) * 100}%`;
              const width = `${100 / totalPanels}%`;
              return (
                <div
                  key={index}
                  className={`car-build-segment ${isRevealed ? 'is-revealed' : ''} ${flashSegment === index ? 'is-flashing' : ''}`}
                  style={{ left, width }}
                  aria-hidden="true"
                />
              );
            })}

          {isComplete && !celebration && (
            <div className="car-build-shine" aria-hidden="true" />
          )}
        </div>
      </CarImageFrame>

      {!isCompact && (
        <p className="car-build-caption">
          {car.manufacturer} {car.name}
        </p>
      )}
    </div>
  );
}
