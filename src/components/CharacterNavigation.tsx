import './CharacterNavigation.css';

type CharacterNavigationProps = {
  character: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function CharacterNavigation({
  character,
  onPrevious,
  onNext,
}: CharacterNavigationProps) {
  return (
    <section className="character-navigation" aria-label="文字の切り替え">
      <button type="button" className="nav-button" onClick={onPrevious}>
        まえ
      </button>

      <div className="current-character" aria-live="polite">
        <span className="current-character-label">いまのもじ</span>
        <span className="current-character-text">{character}</span>
      </div>

      <button type="button" className="nav-button" onClick={onNext}>
        つぎ
      </button>
    </section>
  );
}
