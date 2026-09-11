import { ART, blueprintSegmentAt, type BlueprintSegment } from '../../art/paths';
import './BlueprintArtwork.css';

type BlueprintArtworkProps = {
  segmentIndex: number;
  state?: 'acquired' | 'current' | 'upcoming';
  className?: string;
};

/** generic-car-blueprint.png の3分割表示 */
export function BlueprintArtwork({
  segmentIndex,
  state = 'upcoming',
  className = '',
}: BlueprintArtworkProps) {
  const segment = blueprintSegmentAt(segmentIndex);

  return (
    <div
      className={`blueprint-artwork blueprint-artwork--${segment} blueprint-artwork--${state} ${className}`}
      aria-hidden="true"
    >
      <img
        className="blueprint-artwork__image"
        src={ART.genericBlueprint}
        alt=""
        decoding="async"
      />
    </div>
  );
}

export type { BlueprintSegment };
