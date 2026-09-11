import type { Car } from '../data/cars';
import type { CarDisplayStatus, SavedProgress } from '../types/gameProgress';
import { getNextRequiredCharacter } from '../utils/carProgressStorage';
import {
  getFirstLockedCar,
  isCarCompleted,
  shouldHideLockedCarName,
} from '../utils/carProgressUtils';
import { CarReveal } from './CarReveal';
import { IconBlueprint, IconCheck, IconChevronRight } from './icons/GameIcon';
import { StarRating } from './StarRating';
import './GarageCarCard.css';

type GarageCarCardProps = {
  car: Car;
  progress: SavedProgress;
  status: CarDisplayStatus;
  collectionNumber: number;
  onSelect: (car: Car) => void;
  statusPreview?: CarDisplayStatus | null;
  imagePreviewState?: 'loading' | 'error' | 'normal' | null;
};

/** ガレージのコレクションカード */
export function GarageCarCard({
  car,
  progress,
  status,
  collectionNumber,
  onSelect,
  statusPreview = null,
  imagePreviewState = null,
}: GarageCarCardProps) {
  const displayStatus = statusPreview ?? status;
  const carState = progress.cars[car.id] ?? {
    completedCharacters: [],
    unlocked: false,
  };
  const completedCount = carState.completedCharacters.length;
  const requiredCount = car.requiredCharacters.length;
  const isLocked = displayStatus === 'locked';
  const isCompleted = displayStatus === 'completed';
  const isActive = displayStatus === 'active';
  const isNext = displayStatus === 'next';
  const isDisabled = isLocked;
  const isImmediateNextLocked =
    isLocked && getFirstLockedCar(progress)?.id === car.id;
  const hideName = shouldHideLockedCarName(car, progress);
  const nextRequired = getNextRequiredCharacter(car, carState);

  const showSilhouette = isLocked || isNext;
  const displayName = hideName ? '？？？' : car.name;
  const showUpcomingLabel = isNext || isImmediateNextLocked;

  const handleClick = () => {
    if (isDisabled) return;
    onSelect(car);
  };

  return (
    <article
      className={`garage-collection-card garage-collection-card--${displayStatus}`}
      aria-label={`${car.manufacturer} ${displayName}`}
    >
      <button
        type="button"
        className="garage-collection-card-button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        <div className="garage-collection-card-media">
          <CarReveal
            car={car}
            revealedPanels={
              isActive && !isCarCompleted(car, carState)
                ? completedCount
                : isCompleted
                  ? requiredCount
                  : 0
            }
            totalPanels={requiredCount}
            imagePreviewState={imagePreviewState}
            locked={showSilhouette}
          />
          {showSilhouette && <div className="garage-collection-card-spotlight" aria-hidden="true" />}
        </div>

        <div className="garage-collection-card-body">
          {isCompleted && (
            <p className="garage-collection-card-no">
              No.{String(collectionNumber).padStart(2, '0')}
            </p>
          )}

          {!hideName || showUpcomingLabel ? (
            <p className="garage-collection-card-maker">{car.manufacturer}</p>
          ) : null}
          <p className="garage-collection-card-name">{displayName}</p>

          {isCompleted && (
            <>
              <span className="garage-collection-card-status-icon" aria-hidden="true">
                <IconCheck size="sm" />
              </span>
              <p className="garage-collection-card-stamp">
                <span className="lab-en-label lab-en-label--inline">COMPLETE</span>
                ゲット！
              </p>
              <StarRating car={car} characters={progress.characters} />
            </>
          )}

          {isActive && (
            <>
              <span className="garage-collection-card-status-icon active" aria-hidden="true">
                <IconBlueprint size="sm" />
              </span>
              <p className="garage-collection-card-badge active">
                <span className="lab-en-label lab-en-label--blueprint lab-en-label--inline">BUILD</span>
                いま つくっているよ！
              </p>
              <p className="garage-collection-card-meta">
                せっけいず {completedCount} / {requiredCount}
              </p>
              {nextRequired && (
                <p className="garage-collection-card-next">つぎは「{nextRequired}」</p>
              )}
              <span className="garage-collection-card-cta">つづきから</span>
            </>
          )}

          {showUpcomingLabel && (
            <p className="garage-collection-card-badge next">つぎの くるま</p>
          )}

          {isLocked && !showUpcomingLabel && (
            <>
              <p className="garage-collection-card-badge locked">？？？</p>
              <p className="garage-collection-card-locked-hint">
                まえの くるまを{'\n'}かんせいさせよう！
              </p>
            </>
          )}
        </div>

        {!isDisabled && <IconChevronRight className="garage-collection-card-arrow" />}
      </button>
    </article>
  );
}
