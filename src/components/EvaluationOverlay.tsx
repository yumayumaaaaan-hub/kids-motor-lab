import { useCallback, useEffect, useMemo, useState } from 'react';
import { cars } from '../data/cars';
import type { Car } from '../data/cars';
import type { EvaluationDisplayResult } from '../types/gameProgress';
import type { PrimaryHint } from '../types/writingEvaluation';
import { animationConfig } from '../config/animationConfig';
import { useSound } from '../context/SoundProvider';
import { BlueprintCardSingle } from './BlueprintCards';
import { CarReveal } from './CarReveal';
import { HanamaruVisual } from './art/HanamaruVisual';
import { MotorLabBrand } from './art/MotorLabBrand';
import { NextCarReveal } from './NextCarReveal';
import {
  IconCheck,
  IconGuide,
} from './icons/GameIcon';
import './EvaluationOverlay.css';

type EvaluationOverlayProps = {
  visible: boolean;
  result: EvaluationDisplayResult | null;
  character: string;
  expectedStrokeCount: number;
  isDebugMode: boolean;
  car: Car;
  progress: import('../types/gameProgress').SavedProgress;
  nextCar: Car | null;
  isAllCarsComplete: boolean;
  onRetry: () => void;
  onShowGuide: () => void;
  onNext: () => void;
  onGoGarage: () => void;
  onStartNextCar: () => void;
  forceReducedMotion?: boolean;
};

type RewardPhase = 'message' | 'fly' | 'summary' | 'garage';

const hintMessages: Record<Exclude<PrimaryHint, null>, string> = {
  stroke_count: '',
  start_position: 'あかい まるから かきはじめよう',
  end_position: 'さいごまで ゆっくり かこう',
  direction: 'やじるしの むきに かいてみよう',
  shape: 'うすい せんの ちかくを なぞってみよう',
};

function getHintMessage(
  hint: PrimaryHint,
  character: string,
  expectedStrokeCount: number,
): string {
  if (hint === 'stroke_count') {
    return `「${character}」は ${expectedStrokeCount}かくで かくよ`;
  }
  if (!hint) {
    return '';
  }
  return hintMessages[hint];
}

function getBlueprintPartIndex(
  car: Car,
  character: string,
  completedCount?: number,
): number {
  if (typeof completedCount === 'number' && completedCount > 0) {
    return Math.min(completedCount - 1, car.requiredCharacters.length - 1);
  }
  const index = car.requiredCharacters.indexOf(character);
  return index >= 0 ? index : 0;
}

function ExcellentDecor() {
  return (
    <div className="evaluation-decor evaluation-decor--excellent" aria-hidden="true">
      <span className="evaluation-star evaluation-star--1">★</span>
      <span className="evaluation-star evaluation-star--2">★</span>
      <span className="evaluation-star evaluation-star--3">★</span>
      <svg className="evaluation-hanamaru-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    </div>
  );
}

function PassMessage({
  grade,
  compactHanamaru = false,
}: {
  grade: EvaluationDisplayResult['evaluation']['grade'];
  compactHanamaru?: boolean;
}) {
  const isExcellent = grade === 'excellent';
  return (
    <>
      {isExcellent ? (
        <>
          <ExcellentDecor />
          <HanamaruVisual size={compactHanamaru ? 'small' : 'hero'} />
        </>
      ) : (
        <IconCheck className="evaluation-icon evaluation-icon--check" size="lg" />
      )}
      <p className={`evaluation-title ${isExcellent ? 'excellent' : 'pass'}`}>
        {isExcellent ? 'はなまる！' : 'できた！'}
      </p>
      <p className="evaluation-subtitle evaluation-subtitle--multiline">
        {isExcellent
          ? 'とっても\nじょうずに かけたね！'
          : 'じょうずに\nかけたね！'}
      </p>
    </>
  );
}

function DebugScores({
  evaluation,
  totalScore,
}: {
  evaluation: EvaluationDisplayResult['evaluation'];
  totalScore: number;
}) {
  return (
    <div className="evaluation-debug">
      <p>総合点: {totalScore}</p>
      <p>shapeScore: {evaluation.shapeScore}</p>
      <p>coverageScore: {evaluation.coverageScore}</p>
      <p>startEndScore: {evaluation.startEndScore}</p>
      <p>directionScore: {evaluation.directionScore}</p>
      <p>strokeCountScore: {evaluation.strokeCountScore}</p>
    </div>
  );
}

export function EvaluationOverlay({
  visible,
  result,
  character,
  expectedStrokeCount,
  isDebugMode,
  car,
  progress: _progress,
  nextCar,
  isAllCarsComplete,
  onRetry,
  onShowGuide,
  onNext,
  onGoGarage,
  onStartNextCar,
  forceReducedMotion = false,
}: EvaluationOverlayProps) {
  const { play } = useSound();
  const prefersReducedMotion = useMemo(
    () =>
      forceReducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [forceReducedMotion],
  );
  const [phase, setPhase] = useState<RewardPhase>('message');
  const [animationSkipped, setAnimationSkipped] = useState(false);

  const skipToSummary = useCallback(() => {
    setAnimationSkipped(true);
    setPhase('summary');
  }, []);

  const reward = result?.reward;
  const evaluation = result?.evaluation;
  const isPassed = evaluation?.passed ?? false;
  const showBlueprintAnimation = reward?.kind === 'blueprint';
  const showUnlockAnimation = reward?.kind === 'unlock';
  const hasRewardAnimation = showBlueprintAnimation || showUnlockAnimation;
  const partIndex =
    reward?.kind === 'blueprint'
      ? getBlueprintPartIndex(car, character, reward.completedCount)
      : reward?.kind === 'unlock'
        ? car.requiredCharacters.length - 1
        : getBlueprintPartIndex(car, character);
  const grade = evaluation?.grade ?? 'passed';
  const passVariant = grade === 'excellent' ? 'excellent' : 'passed';

  useEffect(() => {
    if (!visible) {
      setPhase('message');
      setAnimationSkipped(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !result || !hasRewardAnimation) {
      setPhase('message');
      return;
    }

    if (prefersReducedMotion) {
      setPhase('summary');
      return;
    }

    setPhase('message');
    const flyAt =
      animationConfig.blueprintStamp + animationConfig.blueprintHold;
    const summaryAt = flyAt + animationConfig.blueprintFly;
    const garageAt = animationConfig.unlockGarage;

    const flyTimer = window.setTimeout(() => setPhase('fly'), flyAt);
    const summaryTimer = window.setTimeout(() => setPhase('summary'), summaryAt);
    const garageTimer = showUnlockAnimation
      ? window.setTimeout(() => setPhase('garage'), garageAt)
      : undefined;

    return () => {
      window.clearTimeout(flyTimer);
      window.clearTimeout(summaryTimer);
      if (garageTimer) window.clearTimeout(garageTimer);
    };
  }, [
    visible,
    result,
    hasRewardAnimation,
    prefersReducedMotion,
    showUnlockAnimation,
  ]);

  useEffect(() => {
    if (!visible || !evaluation) return;
    const timer = window.setTimeout(() => {
      if (!isPassed) {
        play('retry');
        return;
      }
      if (evaluation.grade === 'excellent') {
        play('excellent');
        return;
      }
      play('passed');
    }, animationConfig.soundDelay);
    return () => window.clearTimeout(timer);
  }, [visible, evaluation, isPassed, play]);

  useEffect(() => {
    if (phase === 'summary' && showBlueprintAnimation) {
      play('blueprint');
    }
    if (phase === 'summary' && showUnlockAnimation) {
      play('car-complete');
    }
    if (phase === 'garage') {
      play('garage');
    }
  }, [phase, showBlueprintAnimation, showUnlockAnimation, play]);

  if (!visible || !result || !evaluation || !reward) {
    return null;
  }

  const remainingCount =
    reward.kind === 'blueprint'
      ? reward.requiredCount - reward.completedCount
      : 0;

  if (!isPassed) {
    return (
      <div className="evaluation-overlay" role="dialog" aria-modal="true">
        <div className="evaluation-card evaluation-card--retry" aria-live="polite">
          <IconGuide className="evaluation-icon evaluation-icon--guide" size="lg" />
          <p className="evaluation-title retry">もうすこし！</p>
          <p className="evaluation-hint">
            {getHintMessage(evaluation.primaryHint, character, expectedStrokeCount) ||
              'ゆっくり なぞってみよう'}
          </p>
          {result.helpModeActive && (
            <p className="evaluation-help-note">かきじゅんを おしえて あげるね</p>
          )}
          {isDebugMode && (
            <DebugScores evaluation={evaluation} totalScore={evaluation.score} />
          )}
          <div className="evaluation-actions">
            <button type="button" className="evaluation-button primary" onClick={onRetry}>
              もういちど
            </button>
            <button type="button" className="evaluation-button secondary" onClick={onShowGuide}>
              かきじゅんを みる
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showUnlockAnimation) {
    const showButtons =
      phase === 'summary' ||
      phase === 'garage' ||
      prefersReducedMotion ||
      animationSkipped;

    return (
      <div
        className="evaluation-overlay evaluation-overlay--spotlight"
        role="dialog"
        aria-modal="true"
        onClick={() => {
          if (phase === 'message' || phase === 'fly') {
            skipToSummary();
          }
        }}
      >
        <div
          className="evaluation-card evaluation-card--unlock"
          aria-live="polite"
          onClick={(event) => event.stopPropagation()}
        >
          {(phase === 'message' || phase === 'fly') && (
            <>
              <PassMessage grade={evaluation.grade} compactHanamaru />
              {phase === 'fly' && !prefersReducedMotion && (
                <div className="evaluation-fly-layer">
                  <BlueprintCardSingle
                    character={character}
                    partIndex={partIndex}
                    state="acquired"
                    className="blueprint-card-flying"
                  />
                </div>
              )}
              {phase === 'message' && (
                <BlueprintCardSingle
                  character={character}
                  partIndex={partIndex}
                  showStamp
                />
              )}
            </>
          )}

          {phase === 'summary' && (
            <>
              <MotorLabBrand emblemOnly centered className="evaluation-completion-emblem" />
              <p className="evaluation-unlock-kicker">
                <span className="lab-en-label lab-en-label--accent">NEW CAR</span>
                くるまが かんせい！
              </p>
              <div className="evaluation-car-spotlight">
                <CarReveal
                  car={car}
                  revealedPanels={car.requiredCharacters.length}
                  totalPanels={car.requiredCharacters.length}
                  variant="showcase"
                  celebration
                />
              </div>
              <p className="evaluation-car-maker">{car.manufacturer}</p>
              <p className="evaluation-car-name">{car.name}</p>
              <p className="evaluation-badge">ゲット！</p>
              <p className="evaluation-garage-hint">マイ ガレージに 登録したよ</p>
            </>
          )}

          {phase === 'garage' && (
            <>
              <div className="evaluation-garage-register">
                <CarReveal
                  car={car}
                  revealedPanels={car.requiredCharacters.length}
                  totalPanels={car.requiredCharacters.length}
                  variant="compact"
                />
              </div>
              <p className="evaluation-title unlock">マイ ガレージに</p>
              <p className="evaluation-subtitle">はいったよ！</p>
              <p className="evaluation-completed-car-maker">{car.manufacturer}</p>
              <p className="evaluation-completed-car-name">{car.name}</p>

              {isAllCarsComplete ? (
                <p className="evaluation-all-complete">
                  {cars.length}だい ぜんぶ ゲットしたよ！
                </p>
              ) : (
                nextCar && (
                  <div className="evaluation-next-car-block">
                    <NextCarReveal nextCar={nextCar} />
                  </div>
                )
              )}
            </>
          )}

          {showButtons && (
            <>
              {isDebugMode && phase !== 'message' && (
                <DebugScores evaluation={evaluation} totalScore={evaluation.score} />
              )}

              <div className="evaluation-actions">
                {isAllCarsComplete ? (
                  <button
                    type="button"
                    className="evaluation-button primary wide evaluation-button--next-car"
                    onClick={onNext}
                  >
                    もういちど かく
                  </button>
                ) : (
                  <button
                    type="button"
                    className="evaluation-button primary wide evaluation-button--next-car"
                    onClick={onStartNextCar}
                  >
                    つぎの くるまへ！
                  </button>
                )}
                <button
                  type="button"
                  className="evaluation-button secondary wide"
                  onClick={onGoGarage}
                >
                  ガレージで みる
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showBlueprintAnimation) {
    const showBlueprintButton =
      phase === 'summary' || prefersReducedMotion || animationSkipped;

    return (
      <div
        className="evaluation-overlay"
        role="dialog"
        aria-modal="true"
        onClick={() => {
          if (phase === 'message' || phase === 'fly') {
            skipToSummary();
          }
        }}
      >
        <div
          className={`evaluation-card evaluation-card--${passVariant}`}
          aria-live="polite"
          onClick={(event) => event.stopPropagation()}
        >
          {phase === 'message' && (
            <>
              <PassMessage grade={evaluation.grade} />
              <BlueprintCardSingle
                character={character}
                partIndex={partIndex}
                showStamp
              />
            </>
          )}

          {phase === 'fly' && (
            <div className="evaluation-fly-layer">
              <BlueprintCardSingle
                character={character}
                partIndex={partIndex}
                state="acquired"
                className="blueprint-card-flying"
              />
            </div>
          )}

          {phase === 'summary' && (
            <>
              <p className="evaluation-title pass">「{character}」の</p>
              <p className="evaluation-reward">せっけいずを{'\u00A0'}ゲット！</p>
              <p className="evaluation-reward">
                {remainingCount > 0 ? `あと ${remainingCount}まい！` : 'あと 0まい！'}
              </p>
              {isDebugMode && (
                <DebugScores evaluation={evaluation} totalScore={evaluation.score} />
              )}
              {showBlueprintButton && (
                <button
                  type="button"
                  className="evaluation-button primary wide"
                  onClick={onNext}
                >
                  つぎへ
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-overlay" role="dialog" aria-modal="true">
      <div
        className={`evaluation-card evaluation-card--${passVariant}`}
        aria-live="polite"
      >
        <PassMessage grade={evaluation.grade} />

        {reward.kind === 'already_unlocked' && (
          <p className="evaluation-reward">{reward.carName}は ゲットずみ！</p>
        )}

        {reward.kind === 'practice_only' && (
          <p className="evaluation-reward">「{reward.character}」は できているよ！</p>
        )}

        {reward.kind === 'none' && (
          <p className="evaluation-reward">れんしゅう おつかれさま！</p>
        )}

        {isDebugMode && (
          <DebugScores evaluation={evaluation} totalScore={evaluation.score} />
        )}

        <button
          type="button"
          className="evaluation-button primary wide"
          onClick={onNext}
        >
          つぎへ
        </button>
      </div>
    </div>
  );
}
