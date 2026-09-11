import type { Car } from '../data/cars';
import type { SavedProgress } from '../types/gameProgress';
import { IconStar } from './icons/GameIcon';
import './StarRating.css';

type StarRatingProps = {
  car: Car;
  characters: Record<string, SavedProgress['characters'][string] | undefined>;
  size?: 'sm' | 'md';
};

/** 文字ごとのはなまる・できた状態を星で表示 */
export function StarRating({ car, characters, size = 'sm' }: StarRatingProps) {
  return (
    <div className="star-rating" role="img" aria-label="はなまるの数">
      {car.requiredCharacters.map((character) => {
        const progress = characters[character];
        let state: 'excellent' | 'passed' | 'none' = 'none';
        if (progress?.excellent) state = 'excellent';
        else if (progress?.passed) state = 'passed';

        const label =
          state === 'excellent'
            ? `「${character}」はなまる`
            : state === 'passed'
              ? `「${character}」できた`
              : `「${character}」まだ`;

        return (
          <span
            key={character}
            className={`star-rating-item star-rating-item--${state}`}
            aria-label={label}
          >
            <IconStar filled={state === 'excellent'} size={size} />
          </span>
        );
      })}
    </div>
  );
}
