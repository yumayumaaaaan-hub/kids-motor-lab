import type { GameMode } from '../utils/characterNavigation';
import './GameModeSwitch.css';

type GameModeSwitchProps = {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
};

/** くるまをつくる / じゆうれんしゅう のコンパクト切り替え */
export function GameModeSwitch({ mode, onChange }: GameModeSwitchProps) {
  return (
    <div className="game-mode-switch" role="tablist" aria-label="モード切り替え">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'build'}
        className={`game-mode-button ${mode === 'build' ? 'active' : ''}`}
        onClick={() => onChange('build')}
      >
        くるま
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'free'}
        className={`game-mode-button ${mode === 'free' ? 'active' : ''}`}
        onClick={() => onChange('free')}
      >
        れんしゅう
      </button>
    </div>
  );
}
