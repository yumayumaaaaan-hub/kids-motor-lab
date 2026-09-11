import {
  IconGuide,
  IconTrash,
  IconUndo,
} from './icons/GameIcon';
import './ActionButtons.css';

type ActionButtonsProps = {
  showGuide: boolean;
  showStrokeOrder: boolean;
  hasStrokes: boolean;
  canComplete: boolean;
  isEvaluating: boolean;
  helpModeActive: boolean;
  strokeOrderButtonVisible?: boolean;
  interactionDisabled?: boolean;
  onToggleGuide: () => void;
  onToggleStrokeOrder: () => void;
  onUndo: () => void;
  onClearAll: () => void;
  onComplete: () => void;
  onPlayGuideAnimation: () => void;
};

export function ActionButtons({
  showGuide,
  showStrokeOrder,
  hasStrokes,
  canComplete,
  isEvaluating,
  helpModeActive,
  strokeOrderButtonVisible = false,
  interactionDisabled = false,
  onToggleGuide,
  onToggleStrokeOrder,
  onUndo,
  onClearAll,
  onComplete,
  onPlayGuideAnimation,
}: ActionButtonsProps) {
  const completeReady = canComplete && !isEvaluating && !interactionDisabled;
  const toolsDisabled = interactionDisabled || isEvaluating;

  const completeLabel = isEvaluating
    ? 'みているよ…'
    : hasStrokes
      ? 'できた！'
      : '1かく かいてね';

  const guideLocked = helpModeActive && !showStrokeOrder;

  return (
    <section
      className={`action-buttons ${interactionDisabled ? 'action-buttons--disabled' : ''}`}
      aria-label="操作ボタン"
    >
      {(strokeOrderButtonVisible || helpModeActive) && !showStrokeOrder && (
        <button
          type="button"
          className="action-button help-animation-button"
          onClick={onPlayGuideAnimation}
          disabled={toolsDisabled}
        >
          かきじゅんを みる
        </button>
      )}

      <div className="action-buttons-toolbar">
        <button
          type="button"
          className="action-button secondary toolbar-button"
          onClick={onUndo}
          disabled={toolsDisabled || !hasStrokes}
          aria-disabled={toolsDisabled || !hasStrokes}
        >
          <IconUndo size="sm" />
          もどす
        </button>
        <button
          type="button"
          className="action-button secondary toolbar-button"
          onClick={onClearAll}
          disabled={toolsDisabled || !hasStrokes}
          aria-disabled={toolsDisabled || !hasStrokes}
        >
          <IconTrash size="sm" />
          けす
        </button>
        <button
          type="button"
          className={`action-button secondary toolbar-button guide-toggle ${showGuide ? 'is-on' : 'is-off'}`}
          onClick={onToggleGuide}
          disabled={toolsDisabled || guideLocked}
          aria-pressed={showGuide}
          aria-disabled={toolsDisabled || guideLocked}
          title={guideLocked ? 'まちがえたあとは おてほんを 表示します' : undefined}
        >
          <IconGuide size="sm" />
          <span className="guide-toggle-label">
            {showGuide ? 'おてほん ON' : 'おてほん OFF'}
          </span>
        </button>
      </div>

      <button
        type="button"
        className={`action-button secondary stroke-order-toggle ${showStrokeOrder ? 'is-on' : 'is-off'}`}
        onClick={onToggleStrokeOrder}
        disabled={toolsDisabled}
        aria-pressed={showStrokeOrder}
        aria-disabled={toolsDisabled}
      >
        {showStrokeOrder ? 'かきじゅん ON' : 'かきじゅん OFF'}
      </button>

      <button
        type="button"
        className={`action-button primary complete-button ${completeReady ? 'is-ready' : ''} ${isEvaluating ? 'is-evaluating' : ''}`}
        onClick={onComplete}
        disabled={!completeReady}
        aria-disabled={!completeReady}
        aria-busy={isEvaluating}
      >
        {completeLabel}
      </button>
    </section>
  );
}
