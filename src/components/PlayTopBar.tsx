import {
  getCompletedCollectionCount,
  getTotalCollectionCount,
} from '../utils/carProgressUtils';
import type { SavedProgress } from '../types/gameProgress';
import { MotorLabBrand } from './art/MotorLabBrand';
import { IconGarage } from './icons/GameIcon';
import './PlayTopBar.css';
import './art/MotorLabBrand.css';

type PlayTopBarProps = {
  progress: SavedProgress;
  onOpenGarage: () => void;
};

/** プレイ画面上部の1行ナビ — KIDS MOTOR LAB ヘッダー */
export function PlayTopBar({
  progress,
  onOpenGarage,
}: PlayTopBarProps) {
  const completed = getCompletedCollectionCount(progress);
  const total = getTotalCollectionCount();

  return (
    <header className="play-top-bar" aria-label="ナビゲーション">
      <MotorLabBrand className="play-top-bar-brand" />
      <button
        type="button"
        className="play-top-bar-garage"
        onClick={onOpenGarage}
        aria-label={`ガレージ ${completed}台 / 全${total}台`}
      >
        <IconGarage size="sm" className="play-top-bar-garage-icon" />
        <span className="play-top-bar-garage-label">ガレージ</span>
        <span className="play-top-bar-garage-count">
          {completed} / {total}
        </span>
      </button>
    </header>
  );
}
