import type { RefObject } from 'react';
import type { Car } from '../data/cars';
import { getNextRequiredCharacter } from '../utils/carProgressStorage';
import { CarReveal } from './CarReveal';
import { BlueprintCards } from './BlueprintCards';
import './GameHeader.css';

type GameHeaderProps = {
  car: Car;
  completedCharacters: string[];
  unlocked: boolean;
  currentCharacter: string;
  practiceMode?: boolean;
  /** 設計図枚数オーバーライド（debugプレビュー） */
  blueprintCountOverride?: number | null;
  imagePreviewState?: 'loading' | 'error' | 'normal' | null;
  carThumbRef?: RefObject<HTMLDivElement | null>;
};

/** コンパクトな車・設計図ヘッダー */
export function GameHeader({
  car,
  completedCharacters,
  unlocked,
  currentCharacter,
  practiceMode = false,
  carThumbRef,
  blueprintCountOverride = null,
  imagePreviewState = null,
}: GameHeaderProps) {
  const completedCount =
    blueprintCountOverride ?? completedCharacters.length;
  const requiredCount = car.requiredCharacters.length;
  const nextCharacter = getNextRequiredCharacter(car, {
    completedCharacters,
    unlocked,
  });

  return (
    <header className="game-header" aria-label="くるまの情報">
      <div className="game-header-main">
        <div className="game-header-car" ref={carThumbRef}>
          <CarReveal
            car={car}
            revealedPanels={completedCount}
            totalPanels={requiredCount}
            variant="compact"
            imagePreviewState={imagePreviewState}
          />
        </div>

        <div className="game-header-info">
          <p className="game-header-car-name">
            {car.manufacturer} {car.name}
          </p>
          <p className="game-header-count">
            せっけいず {completedCount}/{requiredCount}
            {unlocked && <span className="game-header-complete"> ゲット！</span>}
          </p>
        </div>
      </div>

      <BlueprintCards
        compact
        practiceMode={practiceMode}
        requiredCharacters={car.requiredCharacters}
        completedCharacters={
          blueprintCountOverride !== null
            ? car.requiredCharacters.slice(0, blueprintCountOverride)
            : completedCharacters
        }
        nextCharacter={unlocked ? null : nextCharacter ?? currentCharacter}
      />
    </header>
  );
}
