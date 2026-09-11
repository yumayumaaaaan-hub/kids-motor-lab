/** 採点の重み・しきい値（調整はここで行う） */
export const writingEvaluationConfig = {
  /** 各項目の配点（合計100） */
  weights: {
    shape: 45,
    coverage: 20,
    startEnd: 15,
    direction: 10,
    strokeCount: 10,
  },

  /** グレードのしきい値 */
  grades: {
    excellent: 85,
    pass: 62,
  },

  /** おたすけモード（1回まちがえたあと）の緩和 */
  helpMode: {
    /** 合格ラインを下げる点数 */
    passThresholdBonus: 5,
    /** 距離判定を少し広げる倍率 */
    distanceMultiplier: 1.15,
  },

  /** 線の再サンプリング点数 */
  sampleCount: 32,

  /** お手本付近とみなす距離（正規化座標・対角線基準） */
  coverageRadius: 0.09,

  /** 始点・終点の許容距離 */
  startEndRadius: 0.13,

  /** 方向の一致度（0〜1、大きいほど一致） */
  directionMinDot: 0.25,

  /** 1本の線として認める最短長 */
  minStrokeLength: 0.018,

  /** 全体として認める最短長 */
  minTotalLength: 0.045,

  /** 画数が1つ違うときの減点率 */
  strokeCountPenaltyPerDiff: 0.35,
};
