import type { Car } from '../data/cars';
import { CarReveal } from './CarReveal';
import './NextCarReveal.css';

type NextCarRevealProps = {
  nextCar: Car;
  showName?: boolean;
};

/** 車完成後の次の車プレビュー（ガレージの未解放車と同じシルエット表示） */
export function NextCarReveal({ nextCar, showName = true }: NextCarRevealProps) {
  return (
    <div className="next-car-reveal" aria-label="つぎのくるま">
      <p className="next-car-reveal-label">
        <span className="lab-en-label lab-en-label--blueprint lab-en-label--inline">NEXT</span>
        つぎの くるまが まっているよ！
      </p>
      <div className="next-car-reveal-image">
        <CarReveal
          car={nextCar}
          revealedPanels={0}
          totalPanels={nextCar.requiredCharacters.length}
          variant="compact"
        />
      </div>
      <p className="next-car-reveal-name">
        {showName ? `${nextCar.manufacturer} ${nextCar.name}` : '？？？'}
      </p>
    </div>
  );
}
