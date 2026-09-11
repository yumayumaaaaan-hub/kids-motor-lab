import {
  playExcellentSound,
  playPassedSound,
  playRetrySound,
  unlockWebAudio,
} from './webAudioSounds';

export type SoundId =
  | 'button'
  | 'write-start'
  | 'passed'
  | 'excellent'
  | 'retry'
  | 'blueprint'
  | 'car-complete'
  | 'garage';

const soundPaths: Record<SoundId, string> = {
  button: '/sounds/button.mp3',
  'write-start': '/sounds/write-start.mp3',
  passed: '/sounds/passed.mp3',
  excellent: '/sounds/excellent.mp3',
  retry: '/sounds/retry.mp3',
  blueprint: '/sounds/blueprint.mp3',
  'car-complete': '/sounds/car-complete.mp3',
  garage: '/sounds/garage.mp3',
};

/** ブラウザ内蔵の音で鳴らす SE（ファイル不要） */
const synthSounds = new Set<SoundId>(['passed', 'excellent', 'retry']);

const MIN_INTERVAL_MS = 120;

/** 効果音を管理（ファイルがなくても静かに失敗） */
class SoundManager {
  private unlocked = false;

  private failedSounds = new Set<SoundId>();

  private lastPlayedAt = new Map<SoundId, number>();

  private audioCache = new Map<SoundId, HTMLAudioElement>();

  /** ユーザー操作後に呼ぶ（自動再生制限対策） */
  unlock(): void {
    this.unlocked = true;
    unlockWebAudio();
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  play(soundId: SoundId, volume: number, enabled: boolean): void {
    if (!enabled || !this.unlocked || this.failedSounds.has(soundId)) {
      return;
    }

    const now = Date.now();
    const last = this.lastPlayedAt.get(soundId) ?? 0;
    if (now - last < MIN_INTERVAL_MS) {
      return;
    }
    this.lastPlayedAt.set(soundId, now);

    if (synthSounds.has(soundId)) {
      if (soundId === 'passed') {
        playPassedSound(volume);
      } else if (soundId === 'excellent') {
        playExcellentSound(volume);
      } else {
        playRetrySound(volume);
      }
      return;
    }

    let audio = this.audioCache.get(soundId);
    if (!audio) {
      audio = new Audio(soundPaths[soundId]);
      audio.preload = 'none';
      audio.addEventListener('error', () => {
        this.failedSounds.add(soundId);
      });
      this.audioCache.set(soundId, audio);
    }

    try {
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.currentTime = 0;
      void audio.play().catch(() => {
        this.failedSounds.add(soundId);
      });
    } catch {
      this.failedSounds.add(soundId);
    }
  }

  /** デバッグ用：指定音をテスト */
  testSound(soundId: SoundId, volume: number): void {
    this.failedSounds.delete(soundId);
    this.unlocked = true;
    this.play(soundId, volume, true);
  }
}

export const soundManager = new SoundManager();
