import type { Difficulty } from '../config/difficultyConfig';
import { difficultyPresets } from '../config/difficultyConfig';
import type { SavedProgress } from '../types/gameProgress';
import { useSound } from '../context/SoundProvider';
import {
  debugAddBlueprint,
  debugAdvanceToNextCar,
  debugCompleteActiveCar,
  debugCompleteAllCars,
  debugResetTodayStats,
  debugResetTutorial,
  resetProgress,
  updateSettings,
} from '../utils/carProgressStorage';
import { DebugUiPreviewPanel } from './DebugUiPreviewPanel';
import type { DebugUiPreview } from '../types/debugUiPreview';
import './DebugPanel.css';

type DebugPanelProps = {
  progress: SavedProgress;
  onProgressChange: (progress: SavedProgress) => void;
  onResetUI: () => void;
  uiPreview: DebugUiPreview;
  onUiPreviewChange: (preview: DebugUiPreview) => void;
};

/** debug=1 専用の進行操作パネル */
export function DebugPanel({
  progress,
  onProgressChange,
  onResetUI,
  uiPreview,
  onUiPreviewChange,
}: DebugPanelProps) {
  const { testSound } = useSound();

  const runWithConfirm = (
    message: string,
    action: () => SavedProgress,
  ) => {
    if (!window.confirm(message)) {
      return;
    }
    const updated = action();
    onProgressChange(updated);
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    onProgressChange(updateSettings(progress, { difficulty }));
  };

  return (
    <div className="debug-panel" aria-label="デバッグ操作">
      <p className="debug-panel-title">debug 操作</p>

      <div className="debug-panel-info-block">
        <p>version: {progress.version}</p>
        <p>activeCarId: {progress.activeCarId}</p>
        <p>難易度: {difficultyPresets[progress.settings.difficulty].label}</p>
        <p>音量: {progress.settings.volume} / 音: {progress.settings.soundEnabled ? 'ON' : 'OFF'}</p>
        <p>合計挑戦: {progress.stats.totalAttempts}</p>
        <p>
          今日: かいた {progress.stats.today.attempts} / できた {progress.stats.today.passed} /
          はなまる {progress.stats.today.excellent}
        </p>
      </div>

      <div className="debug-panel-buttons">
        <button
          type="button"
          className="debug-panel-button"
          onClick={() =>
            runWithConfirm('設計図を1枚追加しますか？', () =>
              debugAddBlueprint(progress),
            )
          }
        >
          設計図+1
        </button>
        <button
          type="button"
          className="debug-panel-button"
          onClick={() =>
            runWithConfirm('現在の車を完成させますか？', () =>
              debugCompleteActiveCar(progress),
            )
          }
        >
          車を完成
        </button>
        <button
          type="button"
          className="debug-panel-button"
          onClick={() =>
            runWithConfirm('次の車へ進みますか？', () =>
              debugAdvanceToNextCar(progress),
            )
          }
        >
          次の車へ
        </button>
        <button
          type="button"
          className="debug-panel-button"
          onClick={() =>
            runWithConfirm('全車を完成させますか？', () =>
              debugCompleteAllCars(progress),
            )
          }
        >
          全車完成
        </button>
        <button
          type="button"
          className="debug-panel-button"
          onClick={() => onProgressChange(debugResetTodayStats(progress))}
        >
          今日の記録リセット
        </button>
        <button
          type="button"
          className="debug-panel-button"
          onClick={() => onProgressChange(debugResetTutorial(progress))}
        >
          チュートリアルリセット
        </button>
        <button
          type="button"
          className="debug-panel-button"
          onClick={() => testSound('button')}
        >
          音テスト
        </button>
        <button
          type="button"
          className="debug-panel-button danger"
          onClick={() =>
            runWithConfirm('しんちょくを ぜんぶ けしますか？', () => {
              const initial = resetProgress();
              onResetUI();
              return initial;
            })
          }
        >
          全リセット
        </button>
      </div>

      <div className="debug-panel-difficulty">
        <p>難易度テスト</p>
        {(['easy', 'normal', 'hard'] as Difficulty[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`debug-panel-button ${progress.settings.difficulty === key ? 'active' : ''}`}
            onClick={() => handleDifficultyChange(key)}
          >
            {difficultyPresets[key].label}
          </button>
        ))}
      </div>
      <DebugUiPreviewPanel preview={uiPreview} onChange={onUiPreviewChange} />
    </div>
  );
}
