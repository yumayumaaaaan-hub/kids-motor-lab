import { useEffect, useRef } from 'react';
import type { Car } from '../data/cars';
import type { SavedProgress } from '../types/gameProgress';
import { getCharacterStatusLabel } from '../utils/carProgressUtils';
import { CarReveal } from './CarReveal';
import { StarRating } from './StarRating';
import './CarDetailModal.css';

type CarDetailModalProps = {
  car: Car;
  progress: SavedProgress;
  collectionNumber: number;
  isDebugMode: boolean;
  onClose: () => void;
  imagePreviewState?: 'loading' | 'error' | 'normal' | null;
};

/** 完成済み車の展示モーダル */
export function CarDetailModal({
  car,
  progress,
  collectionNumber,
  isDebugMode,
  onClose,
  imagePreviewState = null,
}: CarDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="car-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="car-detail-title"
    >
      <div className="car-detail-modal car-detail-modal--showroom">
        <button
          ref={closeButtonRef}
          type="button"
          className="car-detail-close"
          onClick={onClose}
          aria-label="とじる"
        >
          とじる
        </button>

        <div className="car-detail-showroom">
          <div className="car-detail-showcase">
            <CarReveal
              car={car}
              revealedPanels={car.requiredCharacters.length}
              totalPanels={car.requiredCharacters.length}
              variant="showcase"
              imagePreviewState={imagePreviewState}
            />
          </div>

          <div className="car-detail-info">
            <p className="car-detail-collection-no">
              No.{String(collectionNumber).padStart(2, '0')}
            </p>
            <p className="car-detail-maker">{car.manufacturer}</p>
            <h2 id="car-detail-title" className="car-detail-title">
              {car.name}
            </h2>
            <p className="car-detail-badge">ゲット！</p>
            <StarRating car={car} characters={progress.characters} size="md" />

            <ul className="car-detail-characters" aria-label="ひらがなの状態">
              {car.requiredCharacters.map((character) => {
                const label = getCharacterStatusLabel(character, progress.characters);
                const charProgress = progress.characters[character];
                return (
                  <li key={character} className="car-detail-character-row">
                    <span className="car-detail-character">「{character}」</span>
                    <span className={`car-detail-status car-detail-status--${label}`}>
                      {label}
                    </span>
                    {isDebugMode && charProgress && (
                      <span className="car-detail-debug-score">
                        {charProgress.bestScore}てん
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
