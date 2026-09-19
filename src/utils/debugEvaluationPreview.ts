import type { Car } from '../data/cars';
import type { EvaluationDisplayResult } from '../types/gameProgress';

/** debug=1：結果画面プレビュー用のダミーデータ */
export function buildDebugEvaluationPreview(
  kind: 'excellent' | 'passed' | 'retry' | 'blueprint' | 'unlock',
  car: Car,
  character: string,
): EvaluationDisplayResult {
  const baseEvaluation = {
    score: kind === 'excellent' ? 95 : kind === 'passed' ? 78 : 42,
    passed: kind !== 'retry',
    grade: kind === 'excellent' ? 'excellent' as const : kind === 'retry' ? 'retry' as const : 'passed' as const,
    strokeCountScore: 80,
    shapeScore: 75,
    coverageScore: 70,
    startEndScore: 85,
    directionScore: 80,
    primaryHint: kind === 'retry' ? 'start_position' as const : null,
  };

  if (kind === 'retry') {
    return {
      evaluation: baseEvaluation,
      reward: { kind: 'none' },
      character,
      helpModeActive: false,
    };
  }

  if (kind === 'blueprint') {
    return {
      evaluation: baseEvaluation,
      reward: {
        kind: 'blueprint',
        carName: car.name,
        character,
        completedCount: 1,
        requiredCount: car.requiredCharacters.length,
      },
      character,
      helpModeActive: false,
    };
  }

  if (kind === 'unlock') {
    return {
      evaluation: baseEvaluation,
      reward: { kind: 'unlock', car },
      character,
      helpModeActive: false,
    };
  }

  return {
    evaluation: baseEvaluation,
    reward: { kind: 'none' },
    character,
    helpModeActive: false,
  };
}
