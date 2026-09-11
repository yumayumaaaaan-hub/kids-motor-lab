import { hiraganaList } from '../data/hiraganaCharacters';
import { cars, getCarById, getCarsByUnlockOrder, legacyFirstCarIds } from '../data/cars';
import type {
  CarProgressState,
  CharacterProgress,
  GameSettings,
  SavedProgress,
  SavedProgressV1,
  SavedProgressV2,
  SavedProgressV3,
  SavedProgressV4,
} from '../types/gameProgress';
import { createDefaultSettings } from '../types/gameProgress';
import type { WritingEvaluation } from '../types/writingEvaluation';
import type { Car } from '../data/cars';
import type { PassRewardResult } from '../types/gameProgress';
import {
  checkNewBadges,
  calculateTotalAttempts,
  createEmptyTodayStats,
  normalizeTodayStats,
  recalculateBadges,
  updateTodayStatsAfterEvaluation,
} from './badgeUtils';
import {
  getActiveCar,
  getNextUnlockedCar,
  isCarCompleted,
  isCarLocked,
  resolveActiveCarId,
} from './carProgressUtils';

export const STORAGE_KEY = 'hiragana-writing-practice-progress';
const CURRENT_VERSION = 5 as const;

const defaultCharacterProgress = (): CharacterProgress => ({
  attempts: 0,
  consecutiveRetries: 0,
  bestScore: 0,
  passed: false,
  excellent: false,
});

function emptyCarProgress(): CarProgressState {
  return { completedCharacters: [], unlocked: false };
}

/** 初期進捗 */
export function createInitialProgress(): SavedProgress {
  const characters: Record<string, CharacterProgress> = {};
  for (const item of hiraganaList) {
    characters[item.character] = defaultCharacterProgress();
  }

  const carProgress: Record<string, CarProgressState> = {};
  for (const car of cars) {
    carProgress[car.id] = emptyCarProgress();
  }

  const firstCar = getCarsByUnlockOrder()[0];

  return {
    version: CURRENT_VERSION,
    settings: createDefaultSettings(false),
    activeCarId: firstCar?.id ?? '',
    cars: carProgress,
    characters,
    badges: [],
    stats: {
      totalAttempts: 0,
      today: createEmptyTodayStats(),
    },
  };
}

function readLegacyFirstCarProgress(
  carsData:
    | Partial<SavedProgress['cars']>
    | Partial<SavedProgressV1['cars']>
    | undefined,
  carId: string,
): unknown {
  if (!carsData) return undefined;
  if (carsData[carId] !== undefined) return carsData[carId];
  for (const legacyId of legacyFirstCarIds) {
    if (carsData[legacyId] !== undefined) return carsData[legacyId];
  }
  return undefined;
}

function rebuildCompletedCharacters(raw: string[], car: Car): string[] {
  const result: string[] = [];

  for (let i = 0; i < car.requiredCharacters.length; i += 1) {
    const expected = car.requiredCharacters[i];
    if (i < raw.length && raw[i] === expected) {
      result.push(expected);
      continue;
    }
    if (result.length === i && raw.includes(expected)) {
      result.push(expected);
      continue;
    }
    break;
  }

  return result;
}

function sanitizeCarProgress(raw: unknown, car: Car): CarProgressState {
  const source =
    raw && typeof raw === 'object' ? (raw as Partial<CarProgressState>) : {};
  const rawCompleted = Array.isArray(source.completedCharacters)
    ? source.completedCharacters.filter(
        (c): c is string => typeof c === 'string',
      )
    : [];
  const completedCharacters = rebuildCompletedCharacters(rawCompleted, car);
  const unlocked =
    source.unlocked === true ||
    completedCharacters.length >= car.requiredCharacters.length;
  if (unlocked) {
    return { completedCharacters: [...car.requiredCharacters], unlocked: true };
  }
  return { completedCharacters, unlocked: false };
}

function sanitizeCharacterProgress(raw: unknown): CharacterProgress {
  const source =
    raw && typeof raw === 'object' ? (raw as Partial<CharacterProgress>) : {};
  const attempts =
    typeof source.attempts === 'number' && Number.isFinite(source.attempts)
      ? Math.max(0, Math.floor(source.attempts))
      : 0;
  const consecutiveRetries =
    typeof source.consecutiveRetries === 'number' &&
    Number.isFinite(source.consecutiveRetries)
      ? Math.max(0, Math.floor(source.consecutiveRetries))
      : 0;
  const bestScore =
    typeof source.bestScore === 'number' && Number.isFinite(source.bestScore)
      ? Math.max(0, Math.min(100, Math.floor(source.bestScore)))
      : 0;
  return {
    attempts,
    consecutiveRetries,
    bestScore,
    passed: source.passed === true || bestScore >= 62,
    excellent: source.excellent === true || bestScore >= 85,
  };
}

function sanitizeSettings(raw: unknown, existingUser: boolean): GameSettings {
  const defaults = createDefaultSettings(existingUser);
  const source =
    raw && typeof raw === 'object' ? (raw as Partial<GameSettings>) : {};
  const difficulty =
    source.difficulty === 'easy' ||
    source.difficulty === 'normal' ||
    source.difficulty === 'hard'
      ? source.difficulty
      : defaults.difficulty;
  const volume =
    typeof source.volume === 'number' && Number.isFinite(source.volume)
      ? Math.max(0, Math.min(100, Math.floor(source.volume)))
      : defaults.volume;
  return {
    tutorialCompleted:
      source.tutorialCompleted === undefined
        ? defaults.tutorialCompleted
        : source.tutorialCompleted === true,
    soundEnabled: source.soundEnabled !== false,
    volume,
    difficulty,
  };
}

function buildCoreFromLegacy(
  carsData: unknown,
  charactersData: unknown,
  activeCarId?: string,
): Omit<SavedProgress, 'version' | 'settings' | 'badges' | 'stats'> {
  const carsProgress: Record<string, CarProgressState> = {};
  for (const car of cars) {
    carsProgress[car.id] = sanitizeCarProgress(
      (carsData as Record<string, unknown>)?.[car.id] ??
        readLegacyFirstCarProgress(
          carsData as SavedProgress['cars'],
          car.id,
        ),
      car,
    );
  }
  const characters: Record<string, CharacterProgress> = {};
  for (const item of hiraganaList) {
    characters[item.character] = sanitizeCharacterProgress(
      (charactersData as Record<string, unknown>)?.[item.character],
    );
  }
  const firstCar = getCarsByUnlockOrder()[0];
  let resolvedActive = activeCarId ?? firstCar?.id ?? '';
  if (!getCarById(resolvedActive)) {
    resolvedActive = firstCar?.id ?? '';
  }
  return { activeCarId: resolvedActive, cars: carsProgress, characters };
}

function migrateFromV1(data: SavedProgressV1): SavedProgress {
  const firstCar = getCarsByUnlockOrder()[0];
  if (!firstCar) return createInitialProgress();
  const legacyCar = readLegacyFirstCarProgress(data.cars, firstCar.id) as
    | SavedProgressV1['cars'][string]
    | undefined;
  if (!legacyCar) return createInitialProgress();

  const required = firstCar.requiredCharacters;
  let completedCharacters: string[] = [];
  if (legacyCar.unlocked) {
    completedCharacters = [...required];
  } else {
    const count = Math.max(
      0,
      Math.min(Math.floor(legacyCar.blueprints ?? 0), required.length),
    );
    completedCharacters = required.slice(0, count);
  }
  const unlocked =
    legacyCar.unlocked === true ||
    completedCharacters.length >= required.length;

  const core = buildCoreFromLegacy(
    {
      [firstCar.id]: {
        completedCharacters: unlocked ? [...required] : completedCharacters,
        unlocked,
      },
    },
    {},
    unlocked ? getCarsByUnlockOrder()[1]?.id ?? firstCar.id : firstCar.id,
  );
  return finalizeProgress({
    version: CURRENT_VERSION,
    settings: createDefaultSettings(true),
    badges: [],
    stats: { totalAttempts: 0, today: createEmptyTodayStats() },
    ...core,
  });
}

function migrateFromV2(data: SavedProgressV2): SavedProgress {
  const firstCar = getCarsByUnlockOrder()[0];
  if (!firstCar) return createInitialProgress();
  const carsProgress: Record<string, CarProgressState> = {};
  for (const car of cars) {
    carsProgress[car.id] = sanitizeCarProgress(
      car.id === firstCar.id
        ? readLegacyFirstCarProgress(data.cars, car.id)
        : data.cars?.[car.id],
      car,
    );
  }
  const firstCompleted = isCarCompleted(firstCar, carsProgress[firstCar.id]);
  let activeCarId = firstCar.id;
  if (firstCompleted) {
    activeCarId = getCarsByUnlockOrder()[1]?.id ?? firstCar.id;
  }
  const core = buildCoreFromLegacy(carsProgress, data.characters, activeCarId);
  return finalizeProgress({
    version: CURRENT_VERSION,
    settings: createDefaultSettings(true),
    badges: [],
    stats: {
      totalAttempts: calculateTotalAttempts(core.characters),
      today: createEmptyTodayStats(),
    },
    ...core,
  });
}

function migrateFromV3(data: SavedProgressV3): SavedProgress {
  const core = buildCoreFromLegacy(
    data.cars,
    data.characters,
    data.activeCarId,
  );
  return finalizeProgress({
    version: CURRENT_VERSION,
    settings: createDefaultSettings(true),
    badges: [],
    stats: {
      totalAttempts: calculateTotalAttempts(core.characters),
      today: createEmptyTodayStats(),
    },
    ...core,
  });
}

type ProgressInput = Omit<SavedProgress, 'version'> & { version?: number };

function finalizeProgress(progress: ProgressInput): SavedProgress {
  const carsProgress: Record<string, CarProgressState> = {};
  for (const car of cars) {
    carsProgress[car.id] = sanitizeCarProgress(progress.cars?.[car.id], car);
  }
  const characters: Record<string, CharacterProgress> = {};
  for (const item of hiraganaList) {
    characters[item.character] = sanitizeCharacterProgress(
      progress.characters?.[item.character],
    );
  }
  const hasExistingData =
    calculateTotalAttempts(characters) > 0 ||
    Object.values(carsProgress).some((c) => c.completedCharacters.length > 0);

  const draft: SavedProgress = {
    version: CURRENT_VERSION,
    settings: sanitizeSettings(progress.settings, hasExistingData),
    activeCarId: progress.activeCarId,
    cars: carsProgress,
    characters,
    badges: Array.isArray(progress.badges)
      ? progress.badges.filter((id) => typeof id === 'string')
      : [],
    stats: {
      totalAttempts:
        typeof progress.stats?.totalAttempts === 'number'
          ? Math.max(0, progress.stats.totalAttempts)
          : calculateTotalAttempts(characters),
      today: progress.stats?.today ?? createEmptyTodayStats(),
    },
  };

  const withBadges = {
    ...draft,
    activeCarId: resolveActiveCarId(draft),
    badges:
      draft.badges.length > 0 ? draft.badges : recalculateBadges(draft),
  };

  return normalizeTodayStats(withBadges);
}

export function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createInitialProgress();

    const data = parsed as Partial<
      SavedProgress | SavedProgressV4 | SavedProgressV3 | SavedProgressV2 | SavedProgressV1
    >;

    if (data.version === 1) return migrateFromV1(data as SavedProgressV1);
    if (data.version === 2) return migrateFromV2(data as SavedProgressV2);
    if (data.version === 3) return migrateFromV3(data as SavedProgressV3);
    if (data.version === 4) {
      return finalizeProgress(data as SavedProgressV4);
    }
    if (data.version === 5) {
      return finalizeProgress(data as SavedProgress);
    }
    return createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存失敗時も続行
  }
}

/** 設定のみ更新 */
export function updateSettings(
  progress: SavedProgress,
  settings: Partial<GameSettings>,
): SavedProgress {
  const updated: SavedProgress = {
    ...progress,
    settings: { ...progress.settings, ...settings },
  };
  saveProgress(updated);
  return updated;
}

/** 進捗を初期化（設定は維持） */
export function resetProgress(keepSettings = false): SavedProgress {
  const initial = createInitialProgress();
  if (keepSettings) {
    const current = loadProgress();
    initial.settings = { ...current.settings, tutorialCompleted: false };
  }
  saveProgress(initial);
  return initial;
}

/** ゲーム進捗のみリセット（音・難易度・チュートリアル完了は維持） */
export function resetGameProgress(progress: SavedProgress): SavedProgress {
  const initial = createInitialProgress();
  const updated: SavedProgress = {
    ...initial,
    settings: progress.settings,
  };
  saveProgress(updated);
  return updated;
}

export function setActiveCarId(
  progress: SavedProgress,
  carId: string,
): SavedProgress {
  if (!getCarById(carId)) return progress;
  const updated = { ...progress, activeCarId: carId };
  saveProgress(updated);
  return updated;
}

type ApplyEvaluationInput = {
  progress: SavedProgress;
  character: string;
  evaluation: WritingEvaluation;
  car: Car;
};

type ApplyEvaluationResult = {
  progress: SavedProgress;
  reward: PassRewardResult;
  helpModeActive: boolean;
  newBadges: string[];
};

export function applyEvaluationResult({
  progress,
  character,
  evaluation,
  car,
}: ApplyEvaluationInput): ApplyEvaluationResult {
  const before = normalizeTodayStats(progress);
  const currentCharacter =
    before.characters[character] ?? defaultCharacterProgress();
  const attempts = currentCharacter.attempts + 1;
  const consecutiveRetries = evaluation.passed
    ? 0
    : currentCharacter.consecutiveRetries + 1;
  const helpModeActive = consecutiveRetries >= 1;

  const updatedCharacter: CharacterProgress = {
    attempts,
    consecutiveRetries,
    bestScore: Math.max(currentCharacter.bestScore, evaluation.score),
    passed: currentCharacter.passed || evaluation.passed,
    excellent:
      currentCharacter.excellent ||
      (evaluation.passed && evaluation.grade === 'excellent'),
  };

  let reward: PassRewardResult = { kind: 'none' };
  const carState = before.cars[car.id] ?? emptyCarProgress();
  let updatedCar: CarProgressState = { ...carState };

  if (evaluation.passed) {
    const isRequired = car.requiredCharacters.includes(character);
    if (carState.unlocked || isCarCompleted(car, carState)) {
      reward = { kind: 'already_unlocked', carName: car.name };
    } else if (!isRequired) {
      reward = { kind: 'practice_only', character, score: evaluation.score };
    } else {
      const slotIndex = carState.completedCharacters.length;
      const expectedChar = car.requiredCharacters[slotIndex];

      if (
        slotIndex >= car.requiredCharacters.length ||
        character !== expectedChar
      ) {
        reward = { kind: 'practice_only', character, score: evaluation.score };
      } else {
        const completedCharacters = [...carState.completedCharacters, character];
        const unlocked =
          completedCharacters.length >= car.requiredCharacters.length;
        updatedCar = { completedCharacters, unlocked };
        reward = unlocked
          ? { kind: 'unlock', car }
          : {
              kind: 'blueprint',
              carName: car.name,
              character,
              completedCount: completedCharacters.length,
              requiredCount: car.requiredCharacters.length,
            };
      }
    }
  }

  let updatedProgress: SavedProgress = {
    ...before,
    cars: { ...before.cars, [car.id]: updatedCar },
    characters: { ...before.characters, [character]: updatedCharacter },
  };

  updatedProgress = updateTodayStatsAfterEvaluation(
    updatedProgress,
    evaluation,
    reward,
  );

  const badges = recalculateBadges(updatedProgress);
  updatedProgress = { ...updatedProgress, badges };
  const newBadges = checkNewBadges(before, updatedProgress, reward);

  return {
    progress: updatedProgress,
    reward,
    helpModeActive,
    newBadges,
  };
}

export function getBlueprintCount(carState: CarProgressState): number {
  return carState.completedCharacters.length;
}

export function getNextRequiredCharacter(
  car: Car,
  carState: CarProgressState,
): string | null {
  if (carState.unlocked || isCarCompleted(car, carState)) {
    return null;
  }

  const slotIndex = carState.completedCharacters.length;
  if (slotIndex >= car.requiredCharacters.length) {
    return null;
  }

  return car.requiredCharacters[slotIndex] ?? null;
}

export function debugAddBlueprint(progress: SavedProgress): SavedProgress {
  const activeCar = getActiveCar(progress);
  const carState = progress.cars[activeCar.id] ?? emptyCarProgress();
  if (isCarCompleted(activeCar, carState)) return progress;
  const nextChar = getNextRequiredCharacter(activeCar, carState);
  if (!nextChar) return progress;
  const completedCharacters = [...carState.completedCharacters, nextChar];
  const unlocked =
    completedCharacters.length >= activeCar.requiredCharacters.length;
  const updated: SavedProgress = {
    ...progress,
    cars: {
      ...progress.cars,
      [activeCar.id]: {
        completedCharacters: unlocked
          ? [...activeCar.requiredCharacters]
          : completedCharacters,
        unlocked,
      },
    },
    badges: recalculateBadges({
      ...progress,
      cars: {
        ...progress.cars,
        [activeCar.id]: {
          completedCharacters: unlocked
            ? [...activeCar.requiredCharacters]
            : completedCharacters,
          unlocked,
        },
      },
    }),
  };
  saveProgress(updated);
  return updated;
}

export function debugCompleteActiveCar(progress: SavedProgress): SavedProgress {
  const activeCar = getActiveCar(progress);
  const updated: SavedProgress = {
    ...progress,
    cars: {
      ...progress.cars,
      [activeCar.id]: {
        completedCharacters: [...activeCar.requiredCharacters],
        unlocked: true,
      },
    },
  };
  updated.badges = recalculateBadges(updated);
  saveProgress(updated);
  return updated;
}

export function debugAdvanceToNextCar(progress: SavedProgress): SavedProgress {
  const ordered = getCarsByUnlockOrder();
  const active = getActiveCar(progress);
  const next = ordered[ordered.findIndex((c) => c.id === active.id) + 1];
  if (!next) return progress;
  return setActiveCarId(progress, next.id);
}

export function debugCompleteAllCars(progress: SavedProgress): SavedProgress {
  const carsProgress: Record<string, CarProgressState> = {};
  for (const car of cars) {
    carsProgress[car.id] = {
      completedCharacters: [...car.requiredCharacters],
      unlocked: true,
    };
  }
  const lastCar = getCarsByUnlockOrder()[cars.length - 1];
  const updated: SavedProgress = {
    ...progress,
    cars: carsProgress,
    activeCarId: lastCar?.id ?? progress.activeCarId,
  };
  updated.badges = recalculateBadges(updated);
  saveProgress(updated);
  return updated;
}

export function debugGrantBadge(
  progress: SavedProgress,
  badgeId: string,
): SavedProgress {
  if (progress.badges.includes(badgeId)) return progress;
  const updated = {
    ...progress,
    badges: [...progress.badges, badgeId],
  };
  saveProgress(updated);
  return updated;
}

export function debugResetTodayStats(progress: SavedProgress): SavedProgress {
  const updated = {
    ...progress,
    stats: {
      ...progress.stats,
      today: createEmptyTodayStats(),
    },
  };
  saveProgress(updated);
  return updated;
}

export function debugResetTutorial(progress: SavedProgress): SavedProgress {
  return updateSettings(progress, { tutorialCompleted: false });
}

export function activateNextCar(progress: SavedProgress): SavedProgress {
  const active = getActiveCar(progress);
  const ordered = getCarsByUnlockOrder();
  const idx = ordered.findIndex((c) => c.id === active.id);
  if (idx >= 0 && idx < ordered.length - 1) {
    const nextCar = ordered[idx + 1];
    if (nextCar && !isCarLocked(nextCar, progress)) {
      return setActiveCarId(progress, nextCar.id);
    }
  }
  const nextUnlocked = getNextUnlockedCar(progress);
  if (nextUnlocked) return setActiveCarId(progress, nextUnlocked.id);
  return progress;
}
