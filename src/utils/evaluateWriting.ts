import { writingEvaluationConfig } from '../config/writingEvaluationConfig';
import type { Point, ReferenceStroke } from '../types/strokeData';
import type {
  PrimaryHint,
  WritingEvaluation,
  WritingEvaluationSettings,
  WritingGrade,
} from '../types/writingEvaluation';
import type { Stroke } from '../types';
import {
  averageMinDistance,
  bidirectionalDistance,
  resampleReferenceStroke,
  strokeLength,
} from './strokePathLoader';

const DIAGONAL = Math.SQRT2;

/** 線を等間隔で再サンプリング */
function resampleStroke(stroke: Point[], sampleCount: number): Point[] {
  if (stroke.length === 0) {
    return [];
  }

  if (stroke.length === 1) {
    return [{ ...stroke[0] }];
  }

  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let index = 1; index < stroke.length; index += 1) {
    const length = Math.hypot(
      stroke[index].x - stroke[index - 1].x,
      stroke[index].y - stroke[index - 1].y,
    );
    segmentLengths.push(length);
    totalLength += length;
  }

  if (totalLength <= 0) {
    return [{ ...stroke[0] }];
  }

  const result: Point[] = [];
  let segmentIndex = 0;
  let segmentStart = 0;

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const targetLength =
      (totalLength * sampleIndex) / Math.max(sampleCount - 1, 1);

    while (
      segmentIndex < segmentLengths.length &&
      segmentStart + segmentLengths[segmentIndex] < targetLength
    ) {
      segmentStart += segmentLengths[segmentIndex];
      segmentIndex += 1;
    }

    if (segmentIndex >= segmentLengths.length) {
      result.push({ ...stroke[stroke.length - 1] });
      continue;
    }

    const segmentProgress =
      (targetLength - segmentStart) / segmentLengths[segmentIndex];
    const from = stroke[segmentIndex];
    const to = stroke[segmentIndex + 1];

    result.push({
      x: from.x + (to.x - from.x) * segmentProgress,
      y: from.y + (to.y - from.y) * segmentProgress,
    });
  }

  return result;
}

/** 0〜1へクランプ */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** 距離スコア（近いほど高得点） */
function distanceScore(distanceValue: number, radius: number): number {
  return clamp01(1 - distanceValue / radius);
}

/** 方向の一致度を0〜1で返す */
function computeDirectionScore(userStart: Point, userEnd: Point, reference: ReferenceStroke): number {
  const vector = {
    x: userEnd.x - userStart.x,
    y: userEnd.y - userStart.y,
  };
  const length = Math.hypot(vector.x, vector.y);
  if (length <= 0) {
    return 0;
  }

  const normalized = { x: vector.x / length, y: vector.y / length };
  const dot =
    normalized.x * reference.direction.x + normalized.y * reference.direction.y;

  if (dot >= writingEvaluationConfig.directionMinDot) {
    return clamp01((dot - writingEvaluationConfig.directionMinDot) /
      (1 - writingEvaluationConfig.directionMinDot));
  }

  return clamp01(dot / writingEvaluationConfig.directionMinDot) * 0.4;
}

/** 画数スコア（減点方式） */
function computeStrokeCountScore(
  userCount: number,
  expectedCount: number,
  penaltyScale = 1,
): number {
  const diff = Math.abs(userCount - expectedCount);
  const penalty =
    diff * writingEvaluationConfig.strokeCountPenaltyPerDiff * penaltyScale;
  return clamp01(1 - penalty);
}

/** 最も弱い項目をヒントとして選ぶ */
function pickPrimaryHint(scores: {
  strokeCountScore: number;
  shapeScore: number;
  coverageScore: number;
  startEndScore: number;
  directionScore: number;
}): PrimaryHint {
  const entries: Array<[PrimaryHint, number]> = [
    ['stroke_count', scores.strokeCountScore],
    ['shape', scores.shapeScore],
    ['shape', scores.coverageScore],
    ['start_position', scores.startEndScore],
    ['direction', scores.directionScore],
  ];

  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

type EvaluateInput = {
  userStrokes: Stroke[];
  referenceStrokes: ReferenceStroke[];
  expectedStrokeCount: number;
  settings: WritingEvaluationSettings;
  helpModeRelaxed: boolean;
  /** 難易度による距離許容倍率（1.0が標準） */
  difficultyDistanceScale?: number;
  /** 画数減点倍率（1.0が標準） */
  strokeCountPenaltyScale?: number;
};

/** ユーザーが書いた線を採点する */
export function evaluateWriting({
  userStrokes,
  referenceStrokes,
  expectedStrokeCount,
  settings,
  helpModeRelaxed,
  difficultyDistanceScale = 1,
  strokeCountPenaltyScale = 1,
}: EvaluateInput): WritingEvaluation {
  const config = writingEvaluationConfig;
  const distanceScale =
    (helpModeRelaxed ? config.helpMode.distanceMultiplier : 1) *
    difficultyDistanceScale;

  const validStrokes = userStrokes.filter(
    (stroke) => stroke.length >= 2 && strokeLength(stroke) >= config.minStrokeLength,
  );

  const totalLength = validStrokes.reduce(
    (sum, stroke) => sum + strokeLength(stroke),
    0,
  );

  if (validStrokes.length === 0 || totalLength < config.minTotalLength) {
    return {
      score: 0,
      passed: false,
      grade: 'retry',
      strokeCountScore: 0,
      shapeScore: 0,
      coverageScore: 0,
      startEndScore: 0,
      directionScore: 0,
      primaryHint: 'shape',
    };
  }

  const resampledUser = validStrokes.map((stroke) =>
    resampleStroke(stroke, settings.sampleCount),
  );
  const resampledReference = referenceStrokes.map((stroke) =>
    resampleReferenceStroke(stroke, settings.sampleCount),
  );

  // 期待画数を基準に平均する（不足分は0点として扱い、適当な1画だけ書いても合格しにくくする）
  const strokeSlots = Math.max(expectedStrokeCount, 1);

  let shapeTotal = 0;
  let coverageTotal = 0;
  let startEndTotal = 0;
  let directionTotal = 0;

  for (let index = 0; index < strokeSlots; index += 1) {
    const user = resampledUser[index];
    const reference = resampledReference[index];

    if (!user || !reference) {
      continue;
    }

    const shapeDistance = bidirectionalDistance(user, reference);
    shapeTotal += distanceScore(
      shapeDistance / DIAGONAL,
      config.shapeDistanceRadius * distanceScale,
    );

    const nearRatio =
      user.filter((point) =>
        averageMinDistance([point], reference) <= config.coverageRadius * distanceScale,
      ).length / user.length;
    coverageTotal += nearRatio;

    const startDistance = Math.hypot(
      user[0].x - (referenceStrokes[index]?.start.x ?? reference[0].x),
      user[0].y - (referenceStrokes[index]?.start.y ?? reference[0].y),
    );
    const endDistance = Math.hypot(
      user[user.length - 1].x -
        (referenceStrokes[index]?.end.x ?? reference[reference.length - 1].x),
      user[user.length - 1].y -
        (referenceStrokes[index]?.end.y ?? reference[reference.length - 1].y),
    );

    startEndTotal +=
      (distanceScore(startDistance / DIAGONAL, config.startEndRadius * distanceScale) +
        distanceScore(endDistance / DIAGONAL, config.startEndRadius * distanceScale)) /
      2;

    directionTotal += computeDirectionScore(
      user[0],
      user[user.length - 1],
      referenceStrokes[index] ?? {
        segments: [],
        points: reference,
        start: reference[0],
        end: reference[reference.length - 1],
        direction: { x: 0, y: 0 },
      },
    );
  }

  const divisor = strokeSlots;
  const shapeRatio = shapeTotal / divisor;
  const coverageRatio = coverageTotal / divisor;
  const startEndRatio = startEndTotal / divisor;
  const directionRatio = directionTotal / divisor;
  const strokeCountRatio = computeStrokeCountScore(
    validStrokes.length,
    expectedStrokeCount,
    strokeCountPenaltyScale,
  );

  const shapeScore = Math.round(shapeRatio * config.weights.shape);
  const coverageScore = Math.round(coverageRatio * config.weights.coverage);
  const startEndScore = Math.round(startEndRatio * config.weights.startEnd);
  const directionScore = Math.round(directionRatio * config.weights.direction);
  const strokeCountScore = Math.round(strokeCountRatio * config.weights.strokeCount);

  const score = Math.min(
    100,
    shapeScore + coverageScore + startEndScore + directionScore + strokeCountScore,
  );

  const passThreshold = settings.passThreshold;
  const excellentThreshold = settings.excellentThreshold;
  const meetsShapeRequirement = shapeRatio >= config.minShapeRatio;
  const meetsCoverageRequirement = coverageRatio >= config.minCoverageRatio;
  const passed =
    score >= passThreshold &&
    meetsShapeRequirement &&
    meetsCoverageRequirement;

  let grade: WritingGrade = 'retry';
  if (score >= excellentThreshold) {
    grade = 'excellent';
  } else if (passed) {
    grade = 'passed';
  }

  return {
    score,
    passed,
    grade,
    strokeCountScore,
    shapeScore,
    coverageScore,
    startEndScore,
    directionScore,
    primaryHint: passed
      ? null
      : pickPrimaryHint({
          strokeCountScore: strokeCountRatio,
          shapeScore: shapeRatio,
          coverageScore: coverageRatio,
          startEndScore: startEndRatio,
          directionScore: directionRatio,
        }),
  };
}
