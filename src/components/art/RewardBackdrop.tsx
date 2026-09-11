import type { ReactNode } from 'react';
import { CarImageFrame } from './CarImageFrame';
import './RewardBackdrop.css';

type RewardBackdropProps = {
  children: ReactNode;
  showSpotlight?: boolean;
  showRays?: boolean;
  animate?: boolean;
  className?: string;
};

/** 車完成・報酬演出の背景（スポットライト + 光線） */
export function RewardBackdrop({
  children,
  showSpotlight = true,
  showRays = true,
  animate = true,
  className = '',
}: RewardBackdropProps) {
  return (
    <div className={`reward-backdrop ${className}`}>
      <CarImageFrame
        variant="reward"
        status="completed"
        showGarageBay={false}
        showPlatform={false}
        showSpotlight={showSpotlight}
        showRays={showRays}
        animateSpotlight={animate}
        animateRays={animate}
      >
        <div className="reward-backdrop__inner">{children}</div>
      </CarImageFrame>
    </div>
  );
}
