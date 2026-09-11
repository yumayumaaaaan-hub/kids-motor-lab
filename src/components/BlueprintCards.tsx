import { BlueprintArtwork } from './art/BlueprintArtwork';
import { blueprintPartLabels } from './icons/BlueprintPartArt';
import './BlueprintCards.css';
import './art/BlueprintArtwork.css';
import '../styles/blueprint-plate.css';

export type BlueprintCardState = 'acquired' | 'current' | 'upcoming';

type BlueprintCardsProps = {
  requiredCharacters: string[];
  completedCharacters: string[];
  nextCharacter: string | null;
  compact?: boolean;
  playLayout?: boolean;
  practiceMode?: boolean;
  stampCharacter?: string | null;
};

function getCardState(
  index: number,
  completedCount: number,
): BlueprintCardState {
  if (index < completedCount) {
    return 'acquired';
  }
  if (index === completedCount) {
    return 'current';
  }
  return 'upcoming';
}

function getAriaLabel(state: BlueprintCardState, character: string): string {
  if (state === 'acquired') return `「${character}」せっけいず ゲット`;
  if (state === 'current') return `「${character}」つぎに かく`;
  return `「${character}」まだ`;
}

/** 3枚つながった設計図アセンブリ */
export function BlueprintCards({
  requiredCharacters,
  completedCharacters,
  nextCharacter: _nextCharacter,
  compact = false,
  playLayout = false,
  practiceMode = false,
  stampCharacter = null,
}: BlueprintCardsProps) {
  const count = requiredCharacters.length;
  const completedCount = completedCharacters.length;

  return (
    <div
      className={`blueprint-assembly ${compact ? 'blueprint-assembly--compact' : ''} ${playLayout ? 'blueprint-assembly--play' : ''}`}
      aria-label="せっけいず"
    >
      {practiceMode && (
        <p className="blueprint-assembly-note">れんしゅうモード</p>
      )}
      <div className="blueprint-assembly-row">
        {requiredCharacters.map((character, index) => {
          const state = getCardState(index, completedCount);
          const isFirst = index === 0;
          const isLast = index === count - 1;
          const partLabel = blueprintPartLabels[index] ?? '';
          const showStamp = stampCharacter === character;

          if (playLayout) {
            return (
              <div
                key={`${character}-${index}`}
                className={`blueprint-part blueprint-part--${state} blueprint-part--minimal ${isFirst ? 'blueprint-part--first' : ''} ${isLast ? 'blueprint-part--last' : ''}`}
                aria-current={state === 'current' ? 'step' : undefined}
                aria-label={getAriaLabel(state, character)}
              >
                <span className="blueprint-part-char">{character}</span>
              </div>
            );
          }

          return (
            <div
              key={`${character}-${index}`}
              className={`blueprint-part blueprint-part--${state} ${isFirst ? 'blueprint-part--first' : ''} ${isLast ? 'blueprint-part--last' : ''} ${showStamp && state === 'acquired' ? 'blueprint-plate-glow' : ''}`}
              aria-current={state === 'current' ? 'step' : undefined}
              aria-label={getAriaLabel(state, character)}
            >
              <span className="blueprint-part-code">
                BLUEPRINT {String(index + 1).padStart(2, '0')}
              </span>
              <span className="blueprint-part-zone">{partLabel}</span>
              <BlueprintArtwork segmentIndex={index} state={state} />
              <span className="blueprint-part-char">{character}</span>
              {state === 'current' && (
                <span className="blueprint-part-next-label">NEXT</span>
              )}
              {showStamp && state === 'acquired' && (
                <span className="blueprint-part-stamp blueprint-part-stamp--animate" aria-hidden="true">
                  ゲット！
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 演出用の設計図パーツ1枚 */
export function BlueprintCardSingle({
  character,
  className = '',
  showStamp = false,
  partIndex = 0,
  state = 'current',
}: {
  character: string;
  className?: string;
  showStamp?: boolean;
  partIndex?: number;
  state?: BlueprintCardState;
}) {
  const partLabel = blueprintPartLabels[partIndex] ?? '';
  const cardState = showStamp ? 'acquired' : state;

  return (
    <div
      className={`blueprint-part blueprint-part--${cardState} blueprint-part-single ${showStamp ? 'blueprint-plate-glow' : ''} ${className}`}
    >
      <span className="blueprint-part-code">
        BLUEPRINT {String(partIndex + 1).padStart(2, '0')}
      </span>
      <span className="blueprint-part-zone">{partLabel}</span>
      <BlueprintArtwork segmentIndex={partIndex} state={cardState} />
      <span className="blueprint-part-char">{character}</span>
      {showStamp && (
        <span
          className="blueprint-part-stamp blueprint-part-stamp--navy blueprint-part-stamp--animate"
          aria-hidden="true"
        >
          ゲット！
        </span>
      )}
    </div>
  );
}
