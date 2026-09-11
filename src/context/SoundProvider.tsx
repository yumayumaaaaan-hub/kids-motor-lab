import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { SoundId } from '../utils/soundManager';
import { soundManager } from '../utils/soundManager';
import type { GameSettings } from '../types/gameProgress';

type SoundContextValue = {
  play: (soundId: SoundId) => void;
  unlock: () => void;
  testSound: (soundId: SoundId) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

type SoundProviderProps = {
  settings: GameSettings;
  children: ReactNode;
};

export function SoundProvider({ settings, children }: SoundProviderProps) {
  const play = useCallback(
    (soundId: SoundId) => {
      soundManager.play(soundId, settings.volume, settings.soundEnabled);
    },
    [settings.soundEnabled, settings.volume],
  );

  const unlock = useCallback(() => {
    soundManager.unlock();
  }, []);

  const testSound = useCallback(
    (soundId: SoundId) => {
      soundManager.testSound(soundId, settings.volume);
    },
    [settings.volume],
  );

  const value = useMemo(
    () => ({ play, unlock, testSound }),
    [play, unlock, testSound],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    return {
      play: () => {},
      unlock: () => soundManager.unlock(),
      testSound: () => {},
    };
  }
  return context;
}
