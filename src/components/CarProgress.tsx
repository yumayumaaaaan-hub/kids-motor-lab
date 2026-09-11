import type { Car } from '../data/cars';
import { CarReveal } from './CarReveal';
import { getNextRequiredCharacter } from '../utils/carProgressStorage';
import './CarProgress.css';

type CarProgressProps = {
  car: Car;
  completedCharacters: string[];
  unlocked: boolean;
};

/** 画面上部の車・設計図進捗 */
export function CarProgress({
  car,
  completedCharacters,
  unlocked,
}: CarProgressProps) {
  const nextCharacter = getNextRequiredCharacter(car, {
    completedCharacters,
    unlocked,
  });

  return (
    <section className="car-progress" aria-label="くるまの進捗">
      <div className="car-progress-header">
        <span className="car-progress-icon" aria-hidden="true">
          🚗
        </span>
        <span className="car-progress-name">
          {car.manufacturer} {car.name}の せっけいず
        </span>
      </div>

      <ul className="car-character-list">
        {car.requiredCharacters.map((character, index) => {
          const acquired = index < completedCharacters.length;
          return (
            <li key={`${character}-${index}`} className="car-character-item">
              <span className="car-character-name">{character}</span>
              <span className={`car-character-status ${acquired ? 'acquired' : ''}`}>
                {acquired ? '✓ 獲得済み' : '未獲得'}
              </span>
            </li>
          );
        })}
      </ul>

      {!unlocked && nextCharacter && (
        <p className="car-progress-next">つぎは「{nextCharacter}」を かこう！</p>
      )}

      {unlocked && <p className="car-progress-status unlocked">ゲット！</p>}

      <CarReveal
        car={car}
        revealedPanels={completedCharacters.length}
        totalPanels={car.requiredCharacters.length}
      />
    </section>
  );
}
