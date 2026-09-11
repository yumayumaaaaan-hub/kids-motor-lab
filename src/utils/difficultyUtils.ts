import type { Difficulty } from '../config/difficultyConfig';
import { difficultyPresets } from '../config/difficultyConfig';
import { writingEvaluationConfig } from '../config/writingEvaluationConfig';
import type { WritingEvaluationSettings } from '../types/writingEvaluation';

export type EvaluationParams = {
  settings: WritingEvaluationSettings;
  helpModeRelaxed: boolean;
  distanceScale: number;
  strokeCountPenaltyScale: number;
};

/** 難易度とおたすけモードから採点パラメータを生成 */
export function getEvaluationParams(
  difficulty: Difficulty,
  helpModeActive: boolean,
): EvaluationParams {
  const preset = difficultyPresets[difficulty];
  const helpBonus = helpModeActive
    ? writingEvaluationConfig.helpMode.passThresholdBonus
    : 0;

  return {
    settings: {
      passThreshold: preset.passThreshold - helpBonus,
      excellentThreshold: writingEvaluationConfig.grades.excellent,
      sampleCount: writingEvaluationConfig.sampleCount,
    },
    helpModeRelaxed: helpModeActive,
    distanceScale: preset.distanceScale,
    strokeCountPenaltyScale: preset.strokeCountPenaltyScale,
  };
}
