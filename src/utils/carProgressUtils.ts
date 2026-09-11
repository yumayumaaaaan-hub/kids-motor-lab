import { cars, getCarById, getCarsByUnlockOrder } from '../data/cars';
import type { Car } from '../data/cars';
import type {
  CarDisplayStatus,
  CarProgressState,
  CharacterProgress,
  SavedProgress,
} from '../types/gameProgress';

/** 車が完成済みか */
export function isCarCompleted(
  car: Car,
  carState: CarProgressState | undefined,
): boolean {
  if (!carState) {
    return false;
  }
  return (
    carState.unlocked === true ||
    carState.completedCharacters.length >= car.requiredCharacters.length
  );
}

/** 第2章（日本車）が解放されたか — 外国車100台コンプリート */
export function isTier2Unlocked(progress: SavedProgress): boolean {
  const tier1Cars = cars.filter((car) => (car.tier ?? 1) === 1);
  return tier1Cars.every((car) =>
    isCarCompleted(car, progress.cars[car.id]),
  );
}

/** 前の順番の車が未完成なら locked（第2章は100台コンプリート後） */
export function isCarLocked(
  car: Car,
  progress: SavedProgress,
): boolean {
  if ((car.tier ?? 1) === 2 && !isTier2Unlocked(progress)) {
    return true;
  }

  const ordered = getCarsByUnlockOrder();
  for (const other of ordered) {
    if (other.unlockOrder >= car.unlockOrder) {
      break;
    }
    if (!isCarCompleted(other, progress.cars[other.id])) {
      return true;
    }
  }
  return false;
}

/** 解放済みで未完成の最初の車（active 以外の次候補） */
export function getNextUnlockedCar(progress: SavedProgress): Car | null {
  for (const car of getCarsByUnlockOrder()) {
    if (isCarLocked(car, progress)) {
      continue;
    }
    if (!isCarCompleted(car, progress.cars[car.id])) {
      return car;
    }
  }
  return null;
}

/** 完成済みの次の車（まだ active になっていない候補） */
export function getNextCarAfter(completedCar: Car): Car | null {
  return (
    getCarsByUnlockOrder().find(
      (car) => car.unlockOrder === completedCar.unlockOrder + 1,
    ) ?? null
  );
}

/** activeCarId を安全に補正 */
export function resolveActiveCarId(progress: SavedProgress): string {
  const ordered = getCarsByUnlockOrder();
  const firstCar = ordered[0];
  if (!firstCar) {
    return '';
  }

  const stored = progress.activeCarId;
  const storedCar = stored ? getCarById(stored) : undefined;

  // 完成済みでも activeCarId は維持（「つぎのくるまへ」まで次の車に切り替えない）
  if (storedCar && !isCarLocked(storedCar, progress)) {
    return storedCar.id;
  }

  const nextUnlocked = getNextUnlockedCar(progress);
  if (nextUnlocked) {
    return nextUnlocked.id;
  }

  const allCompleted = ordered.every((car) =>
    isCarCompleted(car, progress.cars[car.id]),
  );
  if (allCompleted) {
    return ordered[ordered.length - 1]?.id ?? firstCar.id;
  }

  return firstCar.id;
}

/** 現在作っている車 */
export function getActiveCar(progress: SavedProgress): Car {
  const id = resolveActiveCarId(progress);
  return getCarById(id) ?? getCarsByUnlockOrder()[0];
}

/** 完成台数 */
export function getCompletedCarCount(progress: SavedProgress): number {
  return getCarsByUnlockOrder().filter((car) =>
    isCarCompleted(car, progress.cars[car.id]),
  ).length;
}

/** ガレージ表示用ステータス */
export function getCarDisplayStatus(
  car: Car,
  progress: SavedProgress,
): CarDisplayStatus {
  const carState = progress.cars[car.id];

  if (isCarCompleted(car, carState)) {
    return 'completed';
  }

  if (isCarLocked(car, progress)) {
    return 'locked';
  }

  const activeId = resolveActiveCarId(progress);
  if (car.id === activeId) {
    return 'active';
  }

  const nextUnlocked = getNextUnlockedCar(progress);
  if (nextUnlocked?.id === car.id) {
    return 'next';
  }

  return 'next';
}

/** 車ごとのはなまる数 */
export function getCarExcellentCount(
  car: Car,
  characters: Record<string, CharacterProgress>,
): number {
  return car.requiredCharacters.filter(
    (character) => characters[character]?.excellent === true,
  ).length;
}

/** 文字の表示ラベル（はなまる / できた / まだ） */
export function getCharacterStatusLabel(
  character: string,
  characters: Record<string, CharacterProgress>,
): 'はなまる' | 'できた' | 'まだ' {
  const progress = characters[character];
  if (progress?.excellent) {
    return 'はなまる';
  }
  if (progress?.passed) {
    return 'できた';
  }
  return 'まだ';
}

/** 全車完成か */
export function areAllCarsCompleted(progress: SavedProgress): boolean {
  return getCompletedCarCount(progress) >= cars.length;
}

/** 最初に locked の車（次に解放される候補） */
export function getFirstLockedCar(progress: SavedProgress): Car | null {
  for (const car of getCarsByUnlockOrder()) {
    if (
      isCarLocked(car, progress) &&
      !isCarCompleted(car, progress.cars[car.id])
    ) {
      return car;
    }
  }
  return null;
}

/** locked 車で名前を隠すか（最も近い locked 以外は ？？？） */
export function shouldHideLockedCarName(
  car: Car,
  progress: SavedProgress,
): boolean {
  if (!isCarLocked(car, progress)) {
    return false;
  }
  const firstLocked = getFirstLockedCar(progress);
  return firstLocked?.id !== car.id;
}
