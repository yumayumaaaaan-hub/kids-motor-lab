import { writingEvaluationConfig } from './writingEvaluationConfig';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type DifficultyPreset = {
  label: string;
  passThreshold: number;
  distanceScale: number;
  strokeCountPenaltyScale: number;
};

/** 難易度ごとの採点パラメータ */
export const difficultyPresets: Record<Difficulty, DifficultyPreset> = {
  easy: {
    label: 'やさしい',
    passThreshold: writingEvaluationConfig.grades.pass - 4,
    distanceScale: 1.05,
    strokeCountPenaltyScale: 0.85,
  },
  normal: {
    label: 'ふつう',
    passThreshold: writingEvaluationConfig.grades.pass,
    distanceScale: 1.0,
    strokeCountPenaltyScale: 1.0,
  },
  hard: {
    label: 'しっかり',
    passThreshold: writingEvaluationConfig.grades.pass + 5,
    distanceScale: 0.9,
    strokeCountPenaltyScale: 1.3,
  },
};

export const defaultDifficulty: Difficulty = 'normal';
