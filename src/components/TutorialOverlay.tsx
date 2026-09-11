import { MotorLabBrand } from './art/MotorLabBrand';
import './TutorialOverlay.css';
import './art/MotorLabBrand.css';

type TutorialStep = 1 | 2 | 3;

type TutorialOverlayProps = {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
};

const stepMessages: Record<TutorialStep, { title: string; button: string }> = {
  1: { title: 'ここに\nかいてね', button: 'つぎへ' },
  2: { title: 'かけたら\n「できた！」', button: 'つぎへ' },
  3: { title: 'もじが かけると\nくるまが できるよ', button: 'はじめる' },
};

/** 初回チュートリアル（背景 z-400 / 強調 z-410 / カード z-430） */
export function TutorialOverlay({
  step,
  onNext,
  onSkip,
}: TutorialOverlayProps) {
  const message = stepMessages[step];

  return (
    <>
      <div className="tutorial-backdrop" aria-hidden="true" />
      <div className="tutorial-card-layer" role="dialog" aria-modal="true">
        <div className="tutorial-card" aria-live="polite">
          {step === 1 && (
            <MotorLabBrand emblemOnly centered className="tutorial-emblem" />
          )}
          <p className="tutorial-title">{message.title}</p>
          <button type="button" className="tutorial-button primary" onClick={onNext}>
            {message.button}
          </button>
          <button type="button" className="tutorial-button skip" onClick={onSkip}>
            スキップ
          </button>
        </div>
      </div>
    </>
  );
}
