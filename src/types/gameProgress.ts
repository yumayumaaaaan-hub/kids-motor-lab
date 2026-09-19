import type { Difficulty } from '../config/difficultyConfig';
import type { Car } from '../data/cars';

/** 1台分の進捗 */
export type CarProgressState = {
  completedCharacters: string[];
  unlocked: boolean;
};

/** 文字ごとの練習記録 */
export type CharacterProgress = {
  attempts: number;
  consecutiveRetries: number;
  bestScore: number;
  passed: boolean;
  excellent: boolean;
};

/** ゲーム設定 */
export type GameSettings = {
  tutorialCompleted: boolean;
  soundEnabled: boolean;
  volume: number;
  difficulty: Difficulty;
};

/** 今日の記録 */
export type TodayStats = {
  date: string;
  attempts: number;
  passed: number;
  excellent: number;
  blueprints: number;
  completedCars: number;
};

/** 統計 */
export type GameStats = {
  totalAttempts: number;
  today: TodayStats;
};

/** localStorage version 1（移行用） */
export type SavedProgressV1 = {
  version: 1;
  cars: Record<
    string,
    {
      blueprints: number;
      unlocked: boolean;
    }
  >;
};

/** localStorage version 2（移行用） */
export type SavedProgressV2 = {
  version: 2;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
};

/** localStorage version 3（移行用） */
export type SavedProgressV3 = {
  version: 3;
  activeCarId: string;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
};

/** localStorage version 4（移行用） */
export type SavedProgressV4 = {
  version: 4;
  settings: GameSettings;
  activeCarId: string;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
  stats: GameStats;
};

/** localStorage version 5（移行用） */
export type SavedProgressV5 = {
  version: 5;
  settings: GameSettings;
  activeCarId: string;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
  stats: GameStats;
};

/** 1つのスペシャルチャレンジ進捗 */
export type SpecialChallengeProgress = {
  completedCharacters: string[];
  unlocked: boolean;
};

/** localStorage version 6（移行用） */
export type SavedProgressV6 = {
  version: 6;
  settings: GameSettings;
  activeCarId: string;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
  stats: GameStats;
  specialChallenge: SpecialChallengeProgress;
};

/** localStorage version 7（移行用） */
export type SavedProgressV7 = {
  version: 7;
  settings: GameSettings;
  activeCarId: string;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
  stats: GameStats;
  specialChallenges: Record<string, SpecialChallengeProgress>;
};

/** localStorage version 8（現在） */
export type SavedProgress = {
  version: 8;
  settings: GameSettings;
  activeCarId: string;
  cars: Record<string, CarProgressState>;
  characters: Record<string, CharacterProgress>;
  stats: GameStats;
  specialChallenges: Record<string, SpecialChallengeProgress>;
};

/** ガレージ表示用の車状態 */
export type CarDisplayStatus = 'locked' | 'next' | 'active' | 'completed';

/** 採点後の設計図・解放結果 */
export type PassRewardResult =
  | { kind: 'none' }
  | {
      kind: 'blueprint';
      carName: string;
      character: string;
      completedCount: number;
      requiredCount: number;
    }
  | { kind: 'unlock'; car: Car }
  | { kind: 'already_unlocked'; carName: string }
  | { kind: 'practice_only'; character: string; score: number };

/** EvaluationOverlay に渡す結果 */
export type EvaluationDisplayResult = {
  evaluation: import('./writingEvaluation').WritingEvaluation;
  reward: PassRewardResult;
  character: string;
  helpModeActive: boolean;
};

/** 画面切り替え */
export type AppScreen = 'writing' | 'garage' | 'special';

/** デフォルト設定 */
export function createDefaultSettings(existingUser = false): GameSettings {
  return {
    tutorialCompleted: existingUser,
    soundEnabled: true,
    volume: 60,
    difficulty: 'normal',
  };
}
