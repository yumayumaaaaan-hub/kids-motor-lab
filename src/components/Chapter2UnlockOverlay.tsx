import './Chapter2UnlockOverlay.css';

type Chapter2UnlockOverlayProps = {
  onDismiss: () => void;
};

/** 外国車100台コンプリート時の第2章解放演出 */
export function Chapter2UnlockOverlay({ onDismiss }: Chapter2UnlockOverlayProps) {
  return (
    <div className="chapter2-unlock-overlay" role="dialog" aria-modal="true">
      <div className="chapter2-unlock-card" aria-live="polite">
        <p className="chapter2-unlock-kicker">CHAPTER 2</p>
        <p className="chapter2-unlock-emoji" aria-hidden="true">
          🎌
        </p>
        <p className="chapter2-unlock-title">だい2しょう かいほう！</p>
        <p className="chapter2-unlock-subtitle">
          にほんしゃが
          <br />
          ひらいたよ！
        </p>
        <p className="chapter2-unlock-detail">
          がれーじに にほんしゃ 100だいが
          <br />
          ついかされたよ
        </p>
        <button type="button" className="chapter2-unlock-button" onClick={onDismiss}>
          やったー！
        </button>
      </div>
    </div>
  );
}
