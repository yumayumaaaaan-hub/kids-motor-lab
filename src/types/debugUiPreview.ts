import type { CarDisplayStatus } from './gameProgress';

/** debug=1 専用：UI表示確認（進捗は変更しない） */
export type DebugUiPreview = {
  /** 設計図枚数オーバーライド（0〜3） */
  blueprintCount?: number | null;
  /** 結果画面プレビュー */
  evaluationPreview?: 'excellent' | 'passed' | 'retry' | 'blueprint' | 'unlock' | null;
  /** 車画像表示状態 */
  carImagePreview?: 'loading' | 'error' | 'normal' | null;
  /** ガレージカード状態プレビュー */
  garageCardPreview?: CarDisplayStatus | null;
  /** prefers-reduced-motion 相当 */
  reducedMotion?: boolean;
  /** チュートリアルステッププレビュー */
  tutorialStep?: 1 | 2 | 3 | null;
  /** プレイモード */
  playMode?: 'build' | 'free' | null;
  /** おたすけモード強制 */
  forceHelpMode?: boolean | null;
  /** 採点中強制 */
  forceEvaluating?: boolean | null;
  /** 描画あり/なし強制 */
  forceHasStrokes?: boolean | null;
  /** お手本ON強制 */
  forceGuideOn?: boolean | null;
};

export const emptyDebugUiPreview: DebugUiPreview = {
  blueprintCount: null,
  evaluationPreview: null,
  carImagePreview: null,
  garageCardPreview: null,
  reducedMotion: false,
  tutorialStep: null,
  playMode: null,
  forceHelpMode: null,
  forceEvaluating: null,
  forceHasStrokes: null,
  forceGuideOn: null,
};
