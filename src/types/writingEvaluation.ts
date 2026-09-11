/** 採点結果のヒント種別 */
export type PrimaryHint =
  | 'stroke_count'
  | 'start_position'
  | 'end_position'
  | 'direction'
  | 'shape'
  | null;

/** 採点のグレード */
export type WritingGrade = 'excellent' | 'passed' | 'retry';

/** 文字の採点結果 */
export type WritingEvaluation = {
  score: number;
  passed: boolean;
  grade: WritingGrade;
  strokeCountScore: number;
  shapeScore: number;
  coverageScore: number;
  startEndScore: number;
  directionScore: number;
  primaryHint: PrimaryHint;
};

/** 採点関数へ渡す設定 */
export type WritingEvaluationSettings = {
  /** 合格ライン（おたすけモード時は下げる） */
  passThreshold: number;
  /** はなまるライン */
  excellentThreshold: number;
  /** 再サンプリング点数 */
  sampleCount: number;
};
