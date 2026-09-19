import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { getHiraganaData } from '../data/hiraganaCharacters';
import type { SpecialChallenge } from '../data/specialChallenge';
import type { GameSettings, SpecialChallengeProgress } from '../types/gameProgress';
import type { ReferenceStroke } from '../types/strokeData';
import type { Stroke } from '../types';
import { getEvaluationParams } from '../utils/difficultyUtils';
import { evaluateWriting } from '../utils/evaluateWriting';
import { loadReferenceCharacter } from '../utils/strokePathLoader';
import { ActionButtons } from './ActionButtons';
import { CarImage } from './CarImage';
import { WritingCanvas, type WritingCanvasHandle } from './WritingCanvas';
import './SpecialChallengeScreen.css';

type SpecialChallengeScreenProps = {
  challenge: SpecialChallenge;
  progress: SpecialChallengeProgress;
  settings: GameSettings;
  onCharacterPassed: (challengeId: string, character: string) => void;
  onBack: () => void;
};

/** 通常車10台で開く、5文字の特別チャレンジ */
export function SpecialChallengeScreen({
  challenge,
  progress,
  settings,
  onCharacterPassed,
  onBack,
}: SpecialChallengeScreenProps) {
  const [started, setStarted] = useState(progress.completedCharacters.length > 0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [referenceStrokes, setReferenceStrokes] = useState<ReferenceStroke[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [message, setMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(progress.unlocked);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const previousUnlockedRef = useRef(progress.unlocked);

  const currentIndex = Math.min(
    progress.completedCharacters.length,
    challenge.characters.length - 1,
  );
  const currentCharacter = challenge.characters[currentIndex];
  const characterData = useMemo(
    () => getHiraganaData(currentCharacter),
    [currentCharacter],
  );

  useEffect(() => {
    if (!characterData || progress.unlocked) return;
    let cancelled = false;
    setReferenceStrokes([]);
    loadReferenceCharacter(characterData.strokeSvgPath).then((reference) => {
      if (!cancelled) setReferenceStrokes(reference.strokes);
    });
    return () => {
      cancelled = true;
    };
  }, [characterData, progress.unlocked]);

  useEffect(() => {
    setStrokes([]);
    setFailed(false);
    setShowGuide(true);
    setMessage('');
  }, [currentIndex]);

  useEffect(() => {
    if (!previousUnlockedRef.current && progress.unlocked) {
      setShowCelebration(true);
    }
    previousUnlockedRef.current = progress.unlocked;
  }, [progress.unlocked]);

  const handleComplete = async () => {
    if (!characterData || strokes.length === 0 || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const reference =
        referenceStrokes.length > 0
          ? referenceStrokes
          : (await loadReferenceCharacter(characterData.strokeSvgPath)).strokes;
      const params = getEvaluationParams(settings.difficulty, failed);
      const evaluation = evaluateWriting({
        userStrokes: strokes,
        referenceStrokes: reference,
        expectedStrokeCount: characterData.expectedStrokeCount,
        settings: params.settings,
        helpModeRelaxed: params.helpModeRelaxed,
        difficultyDistanceScale: params.distanceScale,
        strokeCountPenaltyScale: params.strokeCountPenaltyScale,
      });

      if (evaluation.passed) {
        setMessage('できた！ つぎの もじへ！');
        window.setTimeout(
          () => onCharacterPassed(challenge.id, currentCharacter),
          450,
        );
      } else {
        setFailed(true);
        setMessage('もうすこし！ かきじゅんを みて かこう');
        setStrokes([]);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (progress.unlocked) {
    return (
      <main className={`special-challenge special-challenge--complete${showCelebration ? ' is-celebrating' : ''}`}>
        {showCelebration && (
          <div className="special-confetti" aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => (
              <span
                key={index}
                style={{
                  '--confetti-x': `${(index * 37) % 100}%`,
                  '--confetti-delay': `${(index % 9) * 0.08}s`,
                  '--confetti-rotate': `${(index * 47) % 360}deg`,
                } as CSSProperties}
              />
            ))}
          </div>
        )}
        <div className="special-stars" aria-hidden="true">✦ ✧ ✦</div>
        <p className="special-kicker">SPECIAL CAR GET!</p>
        <h1>{challenge.word} クリア！</h1>
        <div className="special-car-stage special-car-stage--reveal">
          <CarImage
            imagePath={challenge.car.imagePath}
            manufacturer={challenge.car.manufacturer}
            carName={challenge.car.name}
          />
        </div>
        <p className="special-maker">{challenge.car.manufacturer}</p>
        <h2>{challenge.car.name}</h2>
        {showCelebration && (
          <p className="special-celebration-message">あたらしい スーパーカーを ゲット！</p>
        )}
        <button type="button" className="special-primary-button" onClick={onBack}>
          ガレージへ もどる
        </button>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="special-challenge special-challenge--intro">
        <button type="button" className="special-back-button" onClick={onBack}>
          ← ガレージ
        </button>
        <div className="special-stars" aria-hidden="true">✦ ✧ ✦</div>
        <p className="special-kicker">SPECIAL CHALLENGE</p>
        <h1>きんいろの ちょうせん！</h1>
        <p className="special-intro-copy">
          5もじ「{challenge.word}」を かいて<br />
          スーパーカーを ゲットしよう！
        </p>
        <div className="special-car-stage special-car-stage--locked">
          <CarImage
            imagePath={challenge.car.imagePath}
            manufacturer={challenge.car.manufacturer}
            carName={challenge.car.name}
            variant="default"
          />
          <span className="special-lock">?</span>
        </div>
        <button
          type="button"
          className="special-primary-button"
          onClick={() => setStarted(true)}
        >
          ちょうせんする！
        </button>
      </main>
    );
  }

  return (
    <main className="special-challenge special-challenge--writing">
      <header className="special-writing-header">
        <button type="button" className="special-back-button" onClick={onBack}>
          ← ガレージ
        </button>
        <div>
          <p className="special-kicker">SPECIAL CHALLENGE</p>
          <h1>「{challenge.word}」を かこう</h1>
        </div>
      </header>

      <div className="special-word-progress" aria-label="5もじの進み具合">
        {challenge.characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            className={
              index < progress.completedCharacters.length
                ? 'is-complete'
                : index === currentIndex
                  ? 'is-current'
                  : ''
            }
          >
            {character}
          </span>
        ))}
      </div>

      <p className="special-step">
        {currentIndex + 1} / {challenge.characters.length}もじめ
      </p>
      {message && <p className="special-message" aria-live="polite">{message}</p>}

      {characterData && (
        <div className="special-writing-board">
          <WritingCanvas
            ref={canvasRef}
            character={currentCharacter}
            strokeSvgPath={characterData.strokeSvgPath}
            strokes={strokes}
            showGuide={showGuide}
            showStrokeOrder={failed}
            helpMode={failed}
            helpHint={failed ? '①から かいてみよう！' : undefined}
            referenceStrokes={referenceStrokes}
            animateGuide={false}
            interactionDisabled={isEvaluating}
            onStrokeComplete={(stroke) => setStrokes((current) => [...current, stroke])}
            onAnimationComplete={() => undefined}
          />
          <ActionButtons
            showGuide={showGuide}
            showStrokeOrder={failed}
            hasStrokes={strokes.length > 0}
            canComplete={strokes.length > 0}
            isEvaluating={isEvaluating}
            helpModeActive={failed}
            onToggleGuide={() => setShowGuide((current) => !current)}
            onUndo={() => setStrokes((current) => current.slice(0, -1))}
            onClearAll={() => setStrokes([])}
            onComplete={() => void handleComplete()}
          />
        </div>
      )}
    </main>
  );
}

