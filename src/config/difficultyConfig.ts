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
    passThreshold: writingEvaluationConfig.grades.pass - 5,
    distanceScale: 1.12,
    strokeCountPenaltyScale: 0.7,
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
    distanceScale: 0.92,
    strokeCountPenaltyScale: 1.25,
  },
};

export const defaultDifficulty: Difficulty = 'easy';
