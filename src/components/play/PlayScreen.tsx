import type { RefObject } from 'react';
import type { Car } from '../../data/cars';
import type { CarProgressState } from '../../types/gameProgress';
import type { ReferenceStroke } from '../../types/strokeData';
import type { Stroke } from '../../types';
import type { DebugUiPreview } from '../../types/debugUiPreview';
import { ActionButtons } from '../ActionButtons';
import { WritingCanvas, type WritingCanvasHandle } from '../WritingCanvas';
import { VehicleBuildStatus, type AcquirePulseToken } from './VehicleBuildStatus';
import './VehicleBuildStatus.css';
import './PlayScreen.css';

type PlayScreenProps = {
  activeCar: Car;
  carState: CarProgressState;
  currentCharacter: string;
  strokeSvgPath: string;
  strokes: Stroke[];
  showGuide: boolean;
  showStrokeOrder: boolean;
  helpModeActive: boolean;
  helpHint?: string;
  canComplete: boolean;
  isEvaluating: boolean;
  animateGuide: boolean;
  referenceStrokes: ReferenceStroke[];
  interactionDisabled: boolean;
  debugUiPreview: DebugUiPreview;
  acquirePulse?: AcquirePulseToken | null;
  writingCanvasRef: RefObject<WritingCanvasHandle | null>;
  onToggleGuide: () => void;
  onUndo: () => void;
  onClearAll: () => void;
  onComplete: () => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
  onStrokeStart: () => void;
  onStrokeComplete: (stroke: Stroke) => void;
  onAnimationComplete: () => void;
};

/** Design V3：描画優先のプレイ画面 */
export function PlayScreen({
  activeCar,
  carState,
  currentCharacter,
  strokeSvgPath,
  strokes,
  showGuide,
  showStrokeOrder,
  helpModeActive,
  helpHint,
  canComplete,
  isEvaluating,
  animateGuide,
  referenceStrokes,
  interactionDisabled,
  debugUiPreview,
  acquirePulse = null,
  writingCanvasRef,
  onToggleGuide,
  onUndo,
  onClearAll,
  onComplete,
  onDrawingStateChange,
  onStrokeStart,
  onStrokeComplete,
  onAnimationComplete,
}: PlayScreenProps) {
  const effectiveHelpMode =
    debugUiPreview.forceHelpMode ?? helpModeActive;
  const effectiveEvaluating =
    debugUiPreview.forceEvaluating ?? isEvaluating;
  const hasStrokes =
    debugUiPreview.forceHasStrokes === true
      ? true
      : debugUiPreview.forceHasStrokes === false
        ? false
        : strokes.length > 0;
  const effectiveCanComplete =
    debugUiPreview.forceHasStrokes === false
      ? false
      : canComplete;

  const blueprintCompleted =
    debugUiPreview.blueprintCount !== null &&
    debugUiPreview.blueprintCount !== undefined
      ? activeCar.requiredCharacters.slice(0, debugUiPreview.blueprintCount)
      : carState.completedCharacters;

  return (
    <div className="play-screen play-screen--v3">
      <VehicleBuildStatus
        car={activeCar}
        requiredCharacters={activeCar.requiredCharacters}
        completedCharacters={blueprintCompleted}
        unlocked={carState.unlocked}
        imagePreviewState={debugUiPreview.carImagePreview}
        acquirePulse={acquirePulse}
      />

      <div className="play-screen__workspace">
        <div className="play-screen__board">
          <WritingCanvas
            ref={writingCanvasRef}
            character={currentCharacter}
            strokeSvgPath={strokeSvgPath}
            strokes={strokes}
            showGuide={debugUiPreview.forceGuideOn ?? showGuide}
            showStrokeOrder={showStrokeOrder}
            helpMode={effectiveHelpMode}
            helpHint={effectiveHelpMode ? helpHint : undefined}
            referenceStrokes={referenceStrokes}
            animateGuide={animateGuide && !showStrokeOrder}
            interactionDisabled={interactionDisabled || effectiveEvaluating}
            onDrawingStateChange={onDrawingStateChange}
            onStrokeStart={onStrokeStart}
            onStrokeComplete={onStrokeComplete}
            onAnimationComplete={onAnimationComplete}
          />
        </div>

        <ActionButtons
          showGuide={debugUiPreview.forceGuideOn ?? showGuide}
          showStrokeOrder={showStrokeOrder}
          hasStrokes={hasStrokes}
          canComplete={effectiveCanComplete}
          isEvaluating={effectiveEvaluating}
          helpModeActive={effectiveHelpMode}
          interactionDisabled={interactionDisabled}
          onToggleGuide={onToggleGuide}
          onUndo={onUndo}
          onClearAll={onClearAll}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
