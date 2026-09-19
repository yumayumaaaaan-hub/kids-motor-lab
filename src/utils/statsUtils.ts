import { hiraganaList } from '../data/hiraganaCharacters';
import type { PassRewardResult, SavedProgress } from '../types/gameProgress';

/** ローカル日付 YYYY-MM-DD */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 今日の記録を初期化 */
export function createEmptyTodayStats(date = getLocalDateString()) {
  return {
    date,
    attempts: 0,
    passed: 0,
    excellent: 0,
    blueprints: 0,
    completedCars: 0,
  };
}

/** 日付が変わっていたら今日の記録をリセット */
export function normalizeTodayStats(progress: SavedProgress): SavedProgress {
  const today = getLocalDateString();
  if (progress.stats.today.date === today) {
    return progress;
  }
  return {
    ...progress,
    stats: {
      ...progress.stats,
      today: createEmptyTodayStats(today),
    },
  };
}

/** 合計挑戦回数を文字進捗から計算 */
export function calculateTotalAttempts(
  characters: SavedProgress['characters'],
): number {
  return hiraganaList.reduce(
    (sum, item) => sum + (characters[item.character]?.attempts ?? 0),
    0,
  );
}

/** 採点後に今日の記録を更新 */
export function updateTodayStatsAfterEvaluation(
  progress: SavedProgress,
  evaluation: { passed: boolean; grade: string },
  reward: PassRewardResult,
): SavedProgress {
  const normalized = normalizeTodayStats(progress);
  const today = { ...normalized.stats.today };

  today.attempts += 1;
  if (evaluation.passed) today.passed += 1;
  if (evaluation.passed && evaluation.grade === 'excellent') {
    today.excellent += 1;
  }
  if (reward.kind === 'blueprint') today.blueprints += 1;
  if (reward.kind === 'unlock') today.completedCars += 1;

  return {
    ...normalized,
    stats: {
      totalAttempts: normalized.stats.totalAttempts + 1,
      today,
    },
  };
}

