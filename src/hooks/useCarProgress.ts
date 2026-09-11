import { useMemo } from 'react';
import { getCarById } from '../data/cars';
import type { Car } from '../data/cars';
import type { CarDisplayStatus, SavedProgress } from '../types/gameProgress';
import {
  areAllCarsCompleted,
  getActiveCar,
  getCarDisplayStatus,
  getCompletedCarCount,
  getNextCarAfter,
  getNextUnlockedCar,
  isCarCompleted,
  isCarLocked,
} from '../utils/carProgressUtils';

/** 車の解放状態・activeCar・次の車をまとめて扱うフック */
export function useCarProgress(progress: SavedProgress) {
  const activeCar = useMemo(() => getActiveCar(progress), [progress]);
  const completedCount = useMemo(
    () => getCompletedCarCount(progress),
    [progress],
  );
  const allCompleted = useMemo(
    () => areAllCarsCompleted(progress),
    [progress],
  );
  const nextUnlockedCar = useMemo(
    () => getNextUnlockedCar(progress),
    [progress],
  );
  const nextCarAfterActive = useMemo(
    () => getNextCarAfter(activeCar),
    [activeCar],
  );

  const getStatus = (car: Car): CarDisplayStatus =>
    getCarDisplayStatus(car, progress);

  const checkCompleted = (car: Car): boolean =>
    isCarCompleted(car, progress.cars[car.id]);

  const checkLocked = (car: Car): boolean => isCarLocked(car, progress);

  const getCar = (carId: string): Car | undefined => getCarById(carId);

  return {
    progress,
    activeCar,
    activeCarId: progress.activeCarId,
    completedCount,
    allCompleted,
    nextUnlockedCar,
    nextCarAfterActive,
    getStatus,
    isCompleted: checkCompleted,
    isLocked: checkLocked,
    getCar,
  };
}
