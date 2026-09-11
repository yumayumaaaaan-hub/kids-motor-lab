import type { Car } from '../data/cars';
import { CarReveal } from './CarReveal';
import './CarMissionStrip.css';

type CarMissionStripProps = {
  car: Car;
  completedCharacters: string[];
  unlocked: boolean;
  currentCharacter: string;
  blueprintCountOverride?: number | null;
  imagePreviewState?: 'loading' | 'error' | 'normal' | null;
};

/** 上部ミッション帯：くるまゲットの進み具合をコンパクトに表示 */
export function CarMissionStrip({
  car,
  completedCharacters,
  unlocked,
  currentCharacter: _currentCharacter,
  blueprintCountOverride = null,
  imagePreviewState = null,
}: CarMissionStripProps) {
  const completedCount =
    blueprintCountOverride ?? completedCharacters.length;
  const requiredCount = car.requiredCharacters.length;
  const revealedPanels = unlocked ? requiredCount : completedCount;
  const progressPercent = Math.round((completedCount / requiredCount) * 100);

  return (
    <section className="car-mission-strip" aria-label="くるまミッション">
      <div className="car-mission-strip__thumb">
        <CarReveal
          car={car}
          revealedPanels={revealedPanels}
          totalPanels={requiredCount}
          variant="compact"
          imagePreviewState={imagePreviewState}
        />
      </div>

      <div className="car-mission-strip__body">
        <p className="car-mission-strip__label">
          <span className="lab-en-label lab-en-label--accent lab-en-label--inline">BUILD</span>
          {unlocked ? 'ゲット かんせい！' : 'この くるまを ゲット！'}
        </p>
        <p className="car-mission-strip__name">
          {car.manufacturer} {car.name}
        </p>

        <div
          className="car-mission-strip__progress"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={requiredCount}
          aria-label={`もじ ${completedCount} / ${requiredCount}`}
        >
          <div
            className="car-mission-strip__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="car-mission-strip__chars" aria-label="ひらがなの進み">
          {car.requiredCharacters.map((character, index) => {
            const isDone = index < completedCharacters.length;
            const isCurrent =
              !unlocked &&
              index === completedCharacters.length;

            return (
              <span
                key={`${character}-${index}`}
                className={`car-mission-char ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
              >
                {character}
                {isDone && (
                  <span className="car-mission-char__mark" aria-hidden="true">
                    ✓
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
