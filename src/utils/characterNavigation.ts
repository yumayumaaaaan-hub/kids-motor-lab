import { hiraganaList } from '../data/hiraganaCharacters';
import type { Car } from '../data/cars';
import type { CarProgressState } from '../types/gameProgress';
import { getNextRequiredCharacter } from './carProgressStorage';
import { isCarCompleted } from './carProgressUtils';

export type GameMode = 'build' | 'free';

/** 文字から hiraganaList の index を取得 */
export function findCharacterIndex(character: string): number {
  const index = hiraganaList.findIndex((item) => item.character === character);
  return index >= 0 ? index : 0;
}

/** くるまをつくるモードで練習する文字の index */
export function getBuildModeCharacterIndex(
  car: Car,
  carState: CarProgressState,
): number {
  const next = getNextRequiredCharacter(car, carState);
  if (next) {
    return findCharacterIndex(next);
  }

  if (isCarCompleted(car, carState)) {
    const lastRequired =
      car.requiredCharacters[car.requiredCharacters.length - 1];
    return lastRequired ? findCharacterIndex(lastRequired) : 0;
  }

  const firstRequired = car.requiredCharacters[0];
  return firstRequired ? findCharacterIndex(firstRequired) : 0;
}
