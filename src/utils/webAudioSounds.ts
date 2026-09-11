/** ブラウザだけで鳴らす短い効果音（MP3 が無くても動く） */

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  volume: number,
): void {
  const ctx = getContext();
  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

export function unlockWebAudio(): void {
  getContext();
}

/** 正解（合格） */
export function playPassedSound(volumePercent: number): void {
  const ctx = getContext();
  if (!ctx) {
    return;
  }

  const volume = Math.max(0.04, Math.min(0.14, volumePercent / 700));
  const start = ctx.currentTime;
  [523, 659, 784].forEach((freq, index) => {
    playTone(freq, start + index * 0.09, 0.16, 'sine', volume);
  });
}

/** はなまる（高評価） */
export function playExcellentSound(volumePercent: number): void {
  const ctx = getContext();
  if (!ctx) {
    return;
  }

  const volume = Math.max(0.04, Math.min(0.14, volumePercent / 700));
  const start = ctx.currentTime;
  [523, 659, 784, 988, 1047].forEach((freq, index) => {
    playTone(freq, start + index * 0.08, 0.18, 'square', volume * 0.85);
  });
  playTone(1318, start + 0.45, 0.28, 'sine', volume);
}

/** 不正解（もうすこし） */
export function playRetrySound(volumePercent: number): void {
  const ctx = getContext();
  if (!ctx) {
    return;
  }

  const volume = Math.max(0.04, Math.min(0.12, volumePercent / 800));
  const start = ctx.currentTime;
  playTone(330, start, 0.14, 'triangle', volume);
  playTone(262, start + 0.12, 0.2, 'triangle', volume * 0.85);
}
