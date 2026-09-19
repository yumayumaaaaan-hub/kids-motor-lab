import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chapter2UnlockOverlay } from './components/Chapter2UnlockOverlay';
import { DebugPanel } from './components/DebugPanel';
import { EvaluationOverlay } from './components/EvaluationOverlay';
import { GameToast } from './components/GameToast';
import { GarageScreen } from './components/GarageScreen';
import { NextCarIntro } from './components/NextCarIntro';
import { PlayScreen } from './components/play/PlayScreen';
import { SpecialChallengeScreen } from './components/SpecialChallengeScreen';
import type { AcquirePulseToken } from './components/play/VehicleBuildStatus';
import { PlayTopBar } from './components/PlayTopBar';
import { MotorLabBrand } from './components/art/MotorLabBrand';
import { TutorialOverlay } from './components/TutorialOverlay';
import type { WritingCanvasHandle } from './components/WritingCanvas';
import { emptyDebugUiPreview, type DebugUiPreview } from './types/debugUiPreview';
import { buildDebugEvaluationPreview } from './utils/debugEvaluationPreview';
import { animationConfig } from './config/animationConfig';
import { SoundProvider, useSound } from './context/SoundProvider';
import { hiraganaList } from './data/hiraganaCharacters';
import type { AppScreen, EvaluationDisplayResult, SavedProgress } from './types/gameProgress';
import type { ReferenceStroke } from './types/strokeData';
import type { Stroke } from './types';
import type { Car } from './data/cars';
import {
  activateNextCar,
  applyEvaluationResult,
  completeSpecialChallengeCharacter,
  loadProgress,
  resetProgress,
  saveProgress,
  setActiveCarId,
  updateSettings,
} from './utils/carProgressStorage';
import {
  getActiveCar,
  getCompletedCarCount,
  isCarCompleted,
  isTier2Unlocked,
} from './utils/carProgressUtils';
import { getSpecialChallengeById } from './data/specialChallenge';
import { getEvaluationParams } from './utils/difficultyUtils';
import { useCarProgress } from './hooks/useCarProgress';
import {
  getBuildModeCharacterIndex,
} from './utils/characterNavigation';
import { evaluateWriting } from './utils/evaluateWriting';
import { loadReferenceCharacter } from './utils/strokePathLoader';
import './App.css';

type TutorialStep = 1 | 2 | 3;

function App() {
  const initialProgress = useMemo(() => loadProgress(), []);
  const [savedProgress, setSavedProgress] = useState(initialProgress);
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBootReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!bootReady) {
    return (
      <div className="app-boot">
        <MotorLabBrand centered />
        <p className="app-boot-message">くるまを じゅんび中…</p>
      </div>
    );
  }

  return (
    <SoundProvider settings={savedProgress.settings}>
      <AppContent progress={savedProgress} setProgress={setSavedProgress} />
    </SoundProvider>
  );
}

type AppContentProps = {
  progress: SavedProgress;
  setProgress: (progress: SavedProgress) => void;
};

function AppContent({ progress: savedProgress, setProgress: setSavedProgress }: AppContentProps) {
  const { play, unlock } = useSound();

  const [screen, setScreen] = useState<AppScreen>('writing');
  const [selectedSpecialChallengeId, setSelectedSpecialChallengeId] =
    useState<string | null>(null);
  const [showNextCarIntro, setShowNextCarIntro] = useState<Car | null>(null);

  const [tutorialStep, setTutorialStep] = useState<TutorialStep | null>(() =>
    savedProgress.settings.tutorialCompleted ? null : 1,
  );
  const pendingChapter2UnlockRef = useRef(false);
  const [showChapter2Unlock, setShowChapter2Unlock] = useState(false);
  const [showClearToast, setShowClearToast] = useState(false);
  const [strokesUndoSnapshot, setStrokesUndoSnapshot] = useState<Stroke[] | null>(null);

  const savedStrokesRef = useRef<Stroke[] | null>(null);
  const completeInFlightRef = useRef(false);
  const writingCanvasRef = useRef<WritingCanvasHandle>(null);
  const drawingFocusTimerRef = useRef<number | undefined>(undefined);
  const [isDrawingFocus, setIsDrawingFocus] = useState(false);
  const [debugUiPreview, setDebugUiPreview] = useState<DebugUiPreview>(emptyDebugUiPreview);
  const [screenFadeKey, setScreenFadeKey] = useState(0);

  const activeCar = useMemo(() => getActiveCar(savedProgress), [savedProgress]);

  const { allCompleted: allCarsComplete, nextCarAfterActive: nextCarAfterComplete } =
    useCarProgress(savedProgress);

  const [characterIndex, setCharacterIndex] = useState(() =>
    getBuildModeCharacterIndex(
      getActiveCar(savedProgress),
      savedProgress.cars[getActiveCar(savedProgress).id] ?? {
        completedCharacters: [],
        unlocked: false,
      },
    ),
  );

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationDisplayResult | null>(null);
  const [referenceStrokes, setReferenceStrokes] = useState<ReferenceStroke[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [animateGuide, setAnimateGuide] = useState(true);
  const [acquirePulseToken, setAcquirePulseToken] =
    useState<AcquirePulseToken | null>(null);

  const isDebugMode = useMemo(
    () => new URLSearchParams(window.location.search).get('debug') === '1',
    [],
  );

  const currentHiragana = hiraganaList[characterIndex];
  const carState = savedProgress.cars[activeCar.id] ?? {
    completedCharacters: [],
    unlocked: false,
  };
  const characterProgress =
    savedProgress.characters[currentHiragana.character] ?? {
      attempts: 0,
      consecutiveRetries: 0,
      bestScore: 0,
      passed: false,
      excellent: false,
    };

  const helpModeActive = characterProgress.consecutiveRetries >= 1;
  const canComplete =
    strokes.length > 0 &&
    !showEvaluation &&
    !isEvaluating &&
    !isCarCompleted(activeCar, carState);

  const effectiveTutorialStep =
    isDebugMode && debugUiPreview.tutorialStep
      ? debugUiPreview.tutorialStep
      : tutorialStep;

  useEffect(() => {
    setScreenFadeKey((key) => key + 1);
  }, [screen]);

  // 1回でもまちがえたら、お手本とかきじゅんを自動表示する
  useEffect(() => {
    if (helpModeActive) {
      setShowGuide(true);
      setShowStrokeOrder(true);
      setAnimateGuide(false);
    }
  }, [helpModeActive]);

  const handleDrawingStateChange = useCallback((isDrawing: boolean) => {
    window.clearTimeout(drawingFocusTimerRef.current);
    if (isDrawing) {
      setIsDrawingFocus(true);
      return;
    }
    drawingFocusTimerRef.current = window.setTimeout(() => {
      setIsDrawingFocus(false);
    }, animationConfig.drawingFocusRestore);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadReferenceCharacter(currentHiragana.strokeSvgPath)
      .then((reference) => {
        if (!cancelled) {
          setReferenceStrokes(reference.strokes);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReferenceStrokes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentHiragana.strokeSvgPath]);

  /** 文字が変わったらお手本を表示し、かきじゅん表示はリセット */
  useEffect(() => {
    setShowGuide(true);
    setShowStrokeOrder(false);
    setAnimateGuide(true);
  }, [currentHiragana.character, currentHiragana.strokeSvgPath]);

  const showChapter2UnlockIfPending = useCallback(() => {
    if (pendingChapter2UnlockRef.current) {
      pendingChapter2UnlockRef.current = false;
      setShowChapter2Unlock(true);
    }
  }, []);

  const handleChapter2UnlockDismiss = useCallback(() => {
    setShowChapter2Unlock(false);
  }, []);

  const finishTutorial = useCallback(() => {
    setTutorialStep(null);
    const updated = updateSettings(savedProgress, { tutorialCompleted: true });
    setSavedProgress(updated);
  }, [savedProgress, setSavedProgress]);

  const handleTutorialNext = useCallback(() => {
    if (tutorialStep === 3) {
      finishTutorial();
      return;
    }
    setTutorialStep((step) => ((step ?? 0) + 1) as TutorialStep);
  }, [finishTutorial, tutorialStep]);

  const handleTutorialSkip = useCallback(() => {
    finishTutorial();
  }, [finishTutorial]);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
  }, []);

  const closeEvaluation = useCallback(() => {
    setShowEvaluation(false);
    setEvaluationResult(null);
    completeInFlightRef.current = false;
  }, []);

  const replayGuideAnimation = useCallback(() => {
    setShowGuide(true);
    if (showStrokeOrder) {
      setAnimateGuide(false);
      return;
    }
    setAnimateGuide(false);
    window.requestAnimationFrame(() => {
      setAnimateGuide(true);
    });
  }, [showStrokeOrder]);

  const resetPracticeSurface = useCallback(() => {
    clearStrokes();
    closeEvaluation();
    replayGuideAnimation();
    setStrokesUndoSnapshot(null);
    setShowClearToast(false);
  }, [clearStrokes, closeEvaluation, replayGuideAnimation]);

  const syncBuildCharacter = useCallback(
    (progress: SavedProgress, car: Car = getActiveCar(progress)) => {
      const state = progress.cars[car.id] ?? {
        completedCharacters: [],
        unlocked: false,
      };
      setStrokes([]);
      setStrokesUndoSnapshot(null);
      setCharacterIndex(getBuildModeCharacterIndex(car, state));
    },
    [],
  );

  const handleEvaluationNext = useCallback(() => {
    const pulseCharacter =
      evaluationResult?.reward.kind === 'blueprint'
        ? evaluationResult.character
        : null;

    closeEvaluation();
    showChapter2UnlockIfPending();
    clearStrokes();
    setShowGuide(true);

    if (pulseCharacter) {
      setAcquirePulseToken({
        character: pulseCharacter,
        nonce: Date.now(),
      });
    }

    let progress = savedProgress;
    const resolvedCar = getActiveCar(progress);

    if (resolvedCar.id !== progress.activeCarId) {
      progress = setActiveCarId(progress, resolvedCar.id);
      setSavedProgress(progress);
    } else {
      const currentState = progress.cars[resolvedCar.id];
      if (isCarCompleted(resolvedCar, currentState)) {
        progress = activateNextCar(progress);
        setSavedProgress(progress);
      }
    }

    syncBuildCharacter(progress, getActiveCar(progress));
  }, [
    clearStrokes,
    closeEvaluation,
    evaluationResult,
    savedProgress,
    showChapter2UnlockIfPending,
    setSavedProgress,
    syncBuildCharacter,
  ]);

  const handleGoGarage = useCallback(() => {
    closeEvaluation();
    showChapter2UnlockIfPending();
    setScreen('garage');
  }, [closeEvaluation, showChapter2UnlockIfPending]);

  const handleStartNextCar = useCallback(() => {
    closeEvaluation();
    showChapter2UnlockIfPending();
    const nextCar = nextCarAfterComplete;
    if (!nextCar) {
      return;
    }

    const updated = activateNextCar(savedProgress);
    setSavedProgress(updated);
    resetPracticeSurface();
    syncBuildCharacter(updated, nextCar);
    setShowNextCarIntro(nextCar);
  }, [
    closeEvaluation,
    nextCarAfterComplete,
    showChapter2UnlockIfPending,
    resetPracticeSurface,
    savedProgress,
    setSavedProgress,
    syncBuildCharacter,
  ]);

  const handleNextCarIntroFinish = useCallback(() => {
    setShowNextCarIntro(null);
  }, []);

  const handleSelectActiveCar = useCallback(
    (car: Car) => {
      savedStrokesRef.current = null;
      const updated = setActiveCarId(savedProgress, car.id);
      setSavedProgress(updated);
      syncBuildCharacter(updated, car);
    },
    [savedProgress, setSavedProgress, syncBuildCharacter],
  );

  const handleSpecialCharacterPassed = useCallback(
    (challengeId: string, character: string) => {
      play('passed');
      const updated = completeSpecialChallengeCharacter(
        savedProgress,
        challengeId,
        character,
      );
      setSavedProgress(updated);
    },
    [play, savedProgress, setSavedProgress],
  );

  const handleStrokeStart = useCallback(() => {
    unlock();
    play('write-start');
  }, [play, unlock]);

  const handleStrokeComplete = useCallback((stroke: Stroke) => {
    setStrokes((previous) => [...previous, stroke]);
  }, []);

  const handleUndo = useCallback(() => {
    writingCanvasRef.current?.cancelActiveStroke();
    play('button');
    setStrokes((previous) => previous.slice(0, -1));
  }, [play]);

  const handleClearAll = useCallback(() => {
    if (strokes.length === 0) {
      return;
    }
    writingCanvasRef.current?.cancelActiveStroke();
    play('button');
    setStrokesUndoSnapshot(strokes);
    setStrokes([]);
    setShowClearToast(true);
  }, [play, strokes]);

  const handleUndoClear = useCallback(() => {
    if (strokesUndoSnapshot) {
      setStrokes(strokesUndoSnapshot);
      setStrokesUndoSnapshot(null);
    }
    setShowClearToast(false);
  }, [strokesUndoSnapshot]);

  const handleRetry = useCallback(() => {
    closeEvaluation();
    showChapter2UnlockIfPending();
    setShowStrokeOrder(true);
    setShowGuide(true);
    setAnimateGuide(false);
    clearStrokes();
    setStrokesUndoSnapshot(null);
    setShowClearToast(false);
  }, [closeEvaluation, showChapter2UnlockIfPending, clearStrokes]);

  const handleAnimationComplete = useCallback(() => {
    setAnimateGuide(false);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!canComplete || isEvaluating || completeInFlightRef.current) {
      return;
    }

    completeInFlightRef.current = true;
    setIsEvaluating(true);
    play('button');

    try {
      // 画面表示時に読み込み済みのデータを優先（タブレット通信遅延で「みているよ…」が長引くのを防ぐ）
      let evaluationReferenceStrokes = referenceStrokes;
      if (evaluationReferenceStrokes.length === 0) {
        const reference = await loadReferenceCharacter(
          currentHiragana.strokeSvgPath,
        );
        evaluationReferenceStrokes = reference.strokes;
      }

      const params = getEvaluationParams(
        savedProgress.settings.difficulty,
        helpModeActive,
      );

      const evaluation = evaluateWriting({
        userStrokes: strokes,
        referenceStrokes: evaluationReferenceStrokes,
        expectedStrokeCount: currentHiragana.expectedStrokeCount,
        settings: params.settings,
        helpModeRelaxed: params.helpModeRelaxed,
        difficultyDistanceScale: params.distanceScale,
        strokeCountPenaltyScale: params.strokeCountPenaltyScale,
      });

      const wasTier2Locked = !isTier2Unlocked(savedProgress);

      const { progress, reward, helpModeActive: helpAfter } =
        applyEvaluationResult({
          progress: savedProgress,
          character: currentHiragana.character,
          evaluation,
          car: activeCar,
        });

      if (
        wasTier2Locked &&
        isTier2Unlocked(progress) &&
        reward.kind === 'unlock'
      ) {
        pendingChapter2UnlockRef.current = true;
      }

      setSavedProgress(progress);
      saveProgress(progress);
      setEvaluationResult({
        evaluation,
        reward,
        character: currentHiragana.character,
        helpModeActive: helpAfter,
      });
      setShowEvaluation(true);
    } catch {
      setEvaluationResult({
        evaluation: {
          score: 0,
          passed: false,
          grade: 'retry',
          strokeCountScore: 0,
          shapeScore: 0,
          coverageScore: 0,
          startEndScore: 0,
          directionScore: 0,
          primaryHint: 'shape',
        },
        reward: { kind: 'none' },
        character: currentHiragana.character,
        helpModeActive,
      });
      setShowEvaluation(true);
    } finally {
      setIsEvaluating(false);
      completeInFlightRef.current = false;
    }
  }, [
    activeCar,
    canComplete,
    currentHiragana,
    helpModeActive,
    isEvaluating,
    play,
    referenceStrokes,
    savedProgress,
    setSavedProgress,
    strokes,
  ]);

  const handleDebugResetUI = useCallback(() => {
    const initial = resetProgress();
    setSavedProgress(initial);
    setScreen('writing');
    resetPracticeSurface();
    setShowNextCarIntro(null);
    setTutorialStep(null);
    syncBuildCharacter(initial);
  }, [resetPracticeSurface, setSavedProgress, syncBuildCharacter]);

  const handleProgressChange = useCallback(
    (nextProgress: SavedProgress) => {
      saveProgress(nextProgress);
      setSavedProgress(nextProgress);
      syncBuildCharacter(nextProgress);
    },
    [setSavedProgress, syncBuildCharacter],
  );

  const navigateToGarage = useCallback(() => {
    play('button');
    if (strokes.length > 0 && !showEvaluation) {
      savedStrokesRef.current = strokes;
    }
    setScreen('garage');
  }, [play, showEvaluation, strokes]);

  const navigateToWriting = useCallback(() => {
    play('button');
    if (savedStrokesRef.current) {
      setStrokes(savedStrokesRef.current);
      savedStrokesRef.current = null;
    }
    setScreen('writing');
  }, [play]);

  const handleButtonSound = useCallback(() => {
    play('button');
  }, [play]);

  const tutorialHighlightClass =
    effectiveTutorialStep === 1
      ? 'tutorial-highlight-canvas'
      : effectiveTutorialStep === 2
        ? 'tutorial-highlight-complete'
        : effectiveTutorialStep === 3
          ? 'tutorial-highlight-mission'
          : '';

  const debugEvaluationPreview =
    isDebugMode && debugUiPreview.evaluationPreview
      ? buildDebugEvaluationPreview(
          debugUiPreview.evaluationPreview,
          activeCar,
          currentHiragana.character,
        )
      : null;

  const evaluationVisible =
    showEvaluation || (isDebugMode && debugEvaluationPreview !== null);

  const evaluationResultToShow = debugEvaluationPreview ?? evaluationResult;
  const selectedSpecialChallenge = selectedSpecialChallengeId
    ? getSpecialChallengeById(selectedSpecialChallengeId)
    : undefined;

  if (
    screen === 'special' &&
    selectedSpecialChallenge &&
    getCompletedCarCount(savedProgress) >=
      selectedSpecialChallenge.unlockAtCarCount
  ) {
    return (
      <div className="app app-screen-fade" key={`screen-${screenFadeKey}`}>
        <SpecialChallengeScreen
          challenge={selectedSpecialChallenge}
          progress={
            savedProgress.specialChallenges[selectedSpecialChallenge.id] ?? {
              completedCharacters: [],
              unlocked: false,
            }
          }
          settings={savedProgress.settings}
          onCharacterPassed={handleSpecialCharacterPassed}
          onBack={() => setScreen('garage')}
        />
      </div>
    );
  }

  if (screen === 'garage') {
    return (
      <div className="app app-screen-fade" key={`screen-${screenFadeKey}`}>
        <main className="app-main">
          {isDebugMode && (
            <DebugPanel
              progress={savedProgress}
              onProgressChange={handleProgressChange}
              onResetUI={handleDebugResetUI}
              uiPreview={debugUiPreview}
              onUiPreviewChange={setDebugUiPreview}
            />
          )}
          <GarageScreen
            progress={savedProgress}
            isDebugMode={isDebugMode}
            onBackToWriting={navigateToWriting}
            onSelectActiveCar={handleSelectActiveCar}
            onOpenSpecialChallenge={(challengeId) => {
              setSelectedSpecialChallengeId(challengeId);
              setScreen('special');
            }}
            garageCardPreview={debugUiPreview.garageCardPreview}
            carImagePreview={debugUiPreview.carImagePreview}
          />
        </main>
      </div>
    );
  }

  return (
    <div
      className={`app app-screen-fade app--writing ${tutorialHighlightClass} ${effectiveTutorialStep ? 'is-tutorial-active' : ''} ${isDrawingFocus ? 'is-drawing-focus' : ''}`}
      key={`screen-${screenFadeKey}`}
    >
      <main className="app-main">
        {isDebugMode && (
          <DebugPanel
            progress={savedProgress}
            onProgressChange={handleProgressChange}
            onResetUI={handleDebugResetUI}
            uiPreview={debugUiPreview}
            onUiPreviewChange={setDebugUiPreview}
          />
        )}

        <PlayTopBar
          progress={savedProgress}
          onOpenGarage={() => {
            handleButtonSound();
            navigateToGarage();
          }}
        />

        <div className="play-layout play-layout--v3">
          <PlayScreen
            activeCar={activeCar}
            carState={carState}
            currentCharacter={currentHiragana.character}
            strokeSvgPath={currentHiragana.strokeSvgPath}
            strokes={strokes}
            showGuide={showGuide}
            showStrokeOrder={showStrokeOrder}
            helpModeActive={helpModeActive}
            helpHint="ここから かこう！"
            canComplete={canComplete}
            isEvaluating={isEvaluating}
            animateGuide={animateGuide && !showStrokeOrder}
            referenceStrokes={referenceStrokes}
            interactionDisabled={effectiveTutorialStep !== null}
            debugUiPreview={debugUiPreview}
            acquirePulse={acquirePulseToken}
            writingCanvasRef={writingCanvasRef}
            onToggleGuide={() => {
              handleButtonSound();
              if (helpModeActive && !showStrokeOrder) {
                replayGuideAnimation();
                return;
              }
              setShowGuide((value) => !value);
            }}
            onUndo={handleUndo}
            onClearAll={handleClearAll}
            onComplete={() => {
              void handleComplete();
            }}
            onDrawingStateChange={handleDrawingStateChange}
            onStrokeStart={handleStrokeStart}
            onStrokeComplete={handleStrokeComplete}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      </main>

      {effectiveTutorialStep && (
        <TutorialOverlay
          step={effectiveTutorialStep}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
        />
      )}

      <EvaluationOverlay
        visible={evaluationVisible}
        result={evaluationResultToShow}
        character={currentHiragana.character}
        expectedStrokeCount={currentHiragana.expectedStrokeCount}
        isDebugMode={isDebugMode}
        car={activeCar}
        progress={savedProgress}
        nextCar={nextCarAfterComplete}
        isAllCarsComplete={allCarsComplete}
        onRetry={handleRetry}
        onNext={() => {
          if (debugEvaluationPreview) {
            setDebugUiPreview((prev) => ({ ...prev, evaluationPreview: null }));
            return;
          }
          handleEvaluationNext();
        }}
        onGoGarage={() => {
          if (debugEvaluationPreview) {
            setDebugUiPreview((prev) => ({ ...prev, evaluationPreview: null }));
            return;
          }
          handleGoGarage();
        }}
        onStartNextCar={() => {
          if (debugEvaluationPreview) {
            setDebugUiPreview((prev) => ({ ...prev, evaluationPreview: null }));
            return;
          }
          handleStartNextCar();
        }}
        forceReducedMotion={debugUiPreview.reducedMotion}
      />

      {showClearToast && (
        <GameToast
          message="けしたよ"
          actionLabel="もとにもどす"
          onAction={handleUndoClear}
          onDismiss={() => setShowClearToast(false)}
        />
      )}

      {showChapter2Unlock && (
        <Chapter2UnlockOverlay onDismiss={handleChapter2UnlockDismiss} />
      )}

      {showNextCarIntro && (
        <NextCarIntro
          car={showNextCarIntro}
          onStart={handleNextCarIntroFinish}
          onSkip={handleNextCarIntroFinish}
        />
      )}
    </div>
  );
}

export default App;
