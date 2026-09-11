import { cars } from '../data/cars';
import { getCompletedCarCount } from '../utils/carProgressUtils';
import type { SavedProgress } from '../types/gameProgress';
import './CollectionProgress.css';

type CollectionProgressProps = {
  progress: SavedProgress;
  label?: string;
  compact?: boolean;
};

/** 獲得した車の台数を表示 */
export function CollectionProgress({
  progress,
  label = 'くるま',
  compact = false,
}: CollectionProgressProps) {
  const completed = getCompletedCarCount(progress);
  const total = cars.length;

  return (
    <p
      className={`collection-progress ${compact ? 'collection-progress--compact' : ''}`}
      aria-label={`${label} ${completed}台 / 全${total}台`}
    >
      {label} {completed} / {total}
    </p>
  );
}
