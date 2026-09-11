import './MissionPanel.css';

type MissionPanelProps = {
  character: string;
  helpMode?: boolean;
  helpHint?: string;
};

/** 次に書く文字のミッション表示 */
export function MissionPanel({
  character,
  helpMode = false,
  helpHint,
}: MissionPanelProps) {
  return (
    <section className="mission-panel" aria-live="polite">
      {helpMode && (
        <div className="mission-panel__assist" role="status">
          <span className="mission-panel__assist-label">ASSIST MODE</span>
          <span className="mission-panel__assist-text">おたすけ中</span>
        </div>
      )}
      <p className="mission-panel__en">NEXT MISSION</p>
      <p className="mission-panel__ja">
        「<span className="mission-panel__char">{character}</span>」を かこう！
      </p>
      {helpMode && helpHint && (
        <p className="mission-panel__hint">{helpHint}</p>
      )}
    </section>
  );
}
