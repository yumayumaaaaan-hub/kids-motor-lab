import type { Car } from '../data/cars';
import { getNextRequiredCharacter } from '../utils/carProgressStorage';
import './NextCarIntro.css';

type NextCarIntroProps = {
  car: Car;
  onStart: () => void;
  onSkip: () => void;
};

/** 次の車の短い導入演出 */
export function NextCarIntro({ car, onStart, onSkip }: NextCarIntroProps) {
  const firstChar =
    getNextRequiredCharacter(car, {
      completedCharacters: [],
      unlocked: false,
    }) ?? car.requiredCharacters[0];

  return (
    <div className="next-car-intro-overlay" role="dialog" aria-modal="true">
      <div className="next-car-intro-card" aria-live="polite">
        <p className="next-car-intro-kicker">NEW CAR</p>
        <p className="next-car-intro-title">
          つぎは
          <br />
          {car.name}を つくろう！
        </p>
        <p className="next-car-intro-subtitle">
          さいしょは
          <br />「{firstChar}」を かこう！
        </p>
        <button type="button" className="next-car-intro-start" onClick={onStart}>
          はじめる
        </button>
        <button type="button" className="next-car-intro-skip" onClick={onSkip}>
          スキップ
        </button>
      </div>
    </div>
  );
}
