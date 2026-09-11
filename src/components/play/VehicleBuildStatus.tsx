import type { Car } from '../../data/cars';
import { useEffect, useState } from 'react';
import { CarReveal } from '../CarReveal';
import './VehicleBuildStatus.css';
import '../../styles/blueprint-plate.css';

export type AcquirePulseToken = {
  character: string;
  nonce: number;
};

type VehicleBuildStatusProps = {
  car: Car;
  requiredCharacters: string[];
  completedCharacters: string[];
  unlocked: boolean;
  imagePreviewState?: 'loading' | 'error' | 'normal' | null;
  acquirePulse?: AcquirePulseToken | null;
};

function getCharState(
  index: number,
  completedCount: number,
  unlocked: boolean,
): 'acquired' | 'current' | 'upcoming' {
  if (unlocked || index < completedCount) {
    return 'acquired';
  }
  if (index === completedCount) {
    return 'current';
  }
  return 'upcoming';
}

function getCharAriaLabel(
  character: string,
  state: 'acquired' | 'current' | 'upcoming',
): string {
  if (state === 'acquired') {
    return `「${character}」ゲット`;
  }
  if (state === 'current') {
    return `「${character}」つぎに かく`;
  }
  return `「${character}」まだ`;
}

/** Design V3：車情報 + 設計図進捗（コンパクト統合） */
export function VehicleBuildStatus({
  car,
  requiredCharacters,
  completedCharacters,
  unlocked,
  imagePreviewState = null,
  acquirePulse = null,
}: VehicleBuildStatusProps) {
  const completedCount = completedCharacters.length;
  const revealedPanels = unlocked ? requiredCharacters.length : completedCount;
  const [glowingCharacter, setGlowingCharacter] = useState<string | null>(null);

  useEffect(() => {
    if (!acquirePulse) {
      return;
    }

    setGlowingCharacter(acquirePulse.character);
    const timer = window.setTimeout(() => {
      setGlowingCharacter(null);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [acquirePulse]);

  return (
    <section className="vehicle-build-status" aria-label="くるまの開発状況">
      <div className="vehicle-build-status__media">
        <CarReveal
          car={car}
          revealedPanels={revealedPanels}
          totalPanels={requiredCharacters.length}
          variant="compact"
          imagePreviewState={imagePreviewState}
        />
      </div>

      <div className="vehicle-build-status__body">
        <p className="vehicle-build-status__name">{car.name}</p>
        <div
          className="vehicle-build-status__chars"
          role="list"
          aria-label={`設計図 ${completedCount} / ${requiredCharacters.length}`}
        >
          {requiredCharacters.map((character, index) => {
            const state = getCharState(index, completedCount, unlocked);
            const isGlowing =
              state === 'acquired' && glowingCharacter === character;
            return (
              <span
                key={`${character}-${index}`}
                className={`vehicle-build-status__char vehicle-build-status__char--${state} ${isGlowing ? 'blueprint-plate-glow' : ''}`}
                role="listitem"
                aria-label={getCharAriaLabel(character, state)}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className="vehicle-build-status__char-text">{character}</span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
