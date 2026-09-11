import { cars, TIER1_CAR_COUNT } from '../data/cars';
import { hiraganaList } from '../data/hiraganaCharacters';
import type { PassRewardResult, SavedProgress } from '../types/gameProgress';
import { areAllCarsCompleted, getCompletedCarCount, isCarCompleted } from './carProgressUtils';

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
  if (evaluation.passed) {
    today.passed += 1;
  }
  if (evaluation.passed && evaluation.grade === 'excellent') {
    today.excellent += 1;
  }
  if (reward.kind === 'blueprint') {
    today.blueprints += 1;
  }
  if (reward.kind === 'unlock') {
    today.completedCars += 1;
  }

  return {
    ...normalized,
    stats: {
      totalAttempts: normalized.stats.totalAttempts + 1,
      today,
    },
  };
}

/** 進捗から獲得済みバッジを再計算（移行用） */
export function recalculateBadges(progress: SavedProgress): string[] {
  const earned = new Set<string>();
  const totalAttempts = calculateTotalAttempts(progress.characters);

  if (totalAttempts > 0) {
    earned.add('first-writing');
  }

  const hasBlueprint = Object.values(progress.cars).some(
    (car) => car.completedCharacters.length > 0,
  );
  if (hasBlueprint) {
    earned.add('first-blueprint');
  }

  const hasCompletedCar = cars.some((car) =>
    isCarCompleted(car, progress.cars[car.id]),
  );
  if (hasCompletedCar) {
    earned.add('first-car');
  }

  const excellentCount = hiraganaList.filter(
    (item) => progress.characters[item.character]?.excellent,
  ).length;
  if (excellentCount >= 3) {
    earned.add('hanamaru-3');
  }

  if (getCompletedCarCount(progress) >= TIER1_CAR_COUNT) {
    earned.add('cars-100');
  }

  if (areAllCarsCompleted(progress)) {
    earned.add('all-cars');
  }

  if (totalAttempts >= 10) {
    earned.add('practice-10');
  }

  return [...earned];
}

/** 新規獲得バッジを判定 */
export function checkNewBadges(
  before: SavedProgress,
  after: SavedProgress,
  reward: PassRewardResult,
): string[] {
  const beforeSet = new Set(before.badges);
  const afterBadges = recalculateBadges(after);
  const newlyEarned = afterBadges.filter((id) => !beforeSet.has(id));

  if (newlyEarned.length === 0 && reward.kind === 'unlock' && !beforeSet.has('first-car')) {
    if (!newlyEarned.includes('first-car') && afterBadges.includes('first-car')) {
      newlyEarned.push('first-car');
    }
  }

  return newlyEarned;
}
