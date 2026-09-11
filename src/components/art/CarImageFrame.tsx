import type { ReactNode } from 'react';
import { ART } from '../../art/paths';
import './CarImageFrame.css';

export type CarImageFrameVariant = 'compact' | 'garage' | 'showroom' | 'reward';
export type CarImageFrameStatus = 'locked' | 'active' | 'completed';

type CarImageFrameProps = {
  variant?: CarImageFrameVariant;
  status?: CarImageFrameStatus;
  showPlatform?: boolean;
  showGarageBay?: boolean;
  showSpotlight?: boolean;
  showRays?: boolean;
  animateSpotlight?: boolean;
  animateRays?: boolean;
  className?: string;
  children: ReactNode;
};

function defaultsForVariant(variant: CarImageFrameVariant) {
  switch (variant) {
    case 'compact':
      return { showPlatform: false, showGarageBay: true, bayOpacity: 'subtle' as const };
    case 'showroom':
      return { showPlatform: true, showGarageBay: true, bayOpacity: 'strong' as const };
    case 'reward':
      return { showPlatform: true, showGarageBay: true, bayOpacity: 'strong' as const };
    default:
      return { showPlatform: true, showGarageBay: true, bayOpacity: 'normal' as const };
  }
}

/** 車展示フレーム（ガレージ背景・展示台・スポットライト） */
export function CarImageFrame({
  variant = 'garage',
  status = 'active',
  showPlatform: showPlatformProp,
  showGarageBay: showGarageBayProp,
  showSpotlight = false,
  showRays = false,
  animateSpotlight = false,
  animateRays = false,
  className = '',
  children,
}: CarImageFrameProps) {
  const defaults = defaultsForVariant(variant);
  const showPlatform = showPlatformProp ?? defaults.showPlatform;
  const showGarageBay = showGarageBayProp ?? defaults.showGarageBay;

  return (
    <div
      className={`car-display-frame car-display-frame--${variant} car-display-frame--${status} car-display-frame--bay-${defaults.bayOpacity} ${className}`}
    >
      {showSpotlight && (
        <img
          className={`car-display-frame__spotlight ${animateSpotlight ? 'is-animating' : ''}`}
          src={ART.showroomSpotlight}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      )}
      {showRays && (
        <img
          className={`car-display-frame__rays ${animateRays ? 'is-animating' : ''}`}
          src={ART.completeRays}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      )}
      {showGarageBay && (
        <img
          className="car-display-frame__bay"
          src={ART.garageBay}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      )}
      {showPlatform && (
        <img
          className="car-display-frame__platform"
          src={ART.displayPlatform}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      )}
      <div className="car-display-frame__content">{children}</div>
    </div>
  );
}
