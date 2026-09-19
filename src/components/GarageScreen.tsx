import { useMemo, useState } from 'react';
import { getCarsByUnlockOrder, TIER1_CAR_COUNT, TIER2_CAR_COUNT } from '../data/cars';
import type { Car } from '../data/cars';
import {
  getUnlockedSpecialCarCount,
  SPECIAL_CAR_COUNT,
  specialChallenges,
} from '../data/specialChallenge';
import type { SavedProgress } from '../types/gameProgress';
import {
  getCarDisplayStatus,
  getCompletedCarCount,
  getCompletedCollectionCount,
  getTotalCollectionCount,
  isTier2Unlocked,
} from '../utils/carProgressUtils';
import { CarDetailModal } from './CarDetailModal';
import { CarImage } from './CarImage';
import { GarageCarCard } from './GarageCarCard';
import { MotorLabBrand } from './art/MotorLabBrand';
import './GarageScreen.css';
import './art/MotorLabBrand.css';

type GarageScreenProps = {
  progress: SavedProgress;
  isDebugMode: boolean;
  onBackToWriting: () => void;
  onSelectActiveCar: (car: Car) => void;
  onOpenSpecialChallenge: (challengeId: string) => void;
  garageCardPreview?: import('../types/gameProgress').CarDisplayStatus | null;
  carImagePreview?: 'loading' | 'error' | 'normal' | null;
};

type GarageTab = 'tier1' | 'tier2' | 'special';

/** ガレージ画面 */
export function GarageScreen({
  progress,
  isDebugMode,
  onBackToWriting,
  onSelectActiveCar,
  onOpenSpecialChallenge,
  garageCardPreview = null,
  carImagePreview = null,
}: GarageScreenProps) {
  const [detailCar, setDetailCar] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState<GarageTab>('tier1');
  const orderedCars = useMemo(() => getCarsByUnlockOrder(), []);
  const tier1Cars = useMemo(
    () => orderedCars.filter((car) => (car.tier ?? 1) === 1),
    [orderedCars],
  );
  const tier2Cars = useMemo(
    () => orderedCars.filter((car) => (car.tier ?? 1) === 2),
    [orderedCars],
  );
  const tier2Unlocked = isTier2Unlocked(progress);
  const completedCarCount = getCompletedCarCount(progress);
  const completedCollectionCount = getCompletedCollectionCount(progress);
  const totalCollectionCount = getTotalCollectionCount();

  const tier1Completed = useMemo(
    () => tier1Cars.filter((car) => getCarDisplayStatus(car, progress) === 'completed').length,
    [tier1Cars, progress],
  );
  const tier2Completed = useMemo(
    () => tier2Cars.filter((car) => getCarDisplayStatus(car, progress) === 'completed').length,
    [tier2Cars, progress],
  );

  const activeCars = activeTab === 'tier1' ? tier1Cars : tier2Cars;
  const activeCompleted = activeTab === 'tier1' ? tier1Completed : tier2Completed;
  const activeTotal = activeTab === 'tier1' ? TIER1_CAR_COUNT : TIER2_CAR_COUNT;
  const activeCollectionOffset = activeTab === 'tier1' ? 0 : TIER1_CAR_COUNT;

  const detailCollectionNumber = detailCar
    ? orderedCars.findIndex((car) => car.id === detailCar.id) + 1
    : 0;

  const handleTabSelect = (tab: GarageTab) => {
    setActiveTab(tab);
  };

  const handleCardSelect = (car: Car) => {
    const status = getCarDisplayStatus(car, progress);

    if (status === 'completed') {
      setDetailCar(car);
      return;
    }

    // 作成中・次に作る車（前の車が完成済み）は書く画面へ
    if (status === 'active' || status === 'next') {
      onSelectActiveCar(car);
      onBackToWriting();
    }
  };

  const renderCarCard = (car: Car, collectionNumber: number) => (
    <GarageCarCard
      key={car.id}
      car={car}
      progress={progress}
      status={getCarDisplayStatus(car, progress)}
      collectionNumber={collectionNumber}
      onSelect={handleCardSelect}
      statusPreview={collectionNumber === 1 ? garageCardPreview : null}
      imagePreviewState={collectionNumber === 1 ? carImagePreview : null}
    />
  );

  return (
    <div className="garage-screen">
      <header className="garage-header">
        <div className="garage-header-top">
          <div className="garage-header-brand-block">
            <MotorLabBrand className="garage-header-brand" />
            <h1 className="garage-title">
              <span className="garage-title-en">GARAGE</span>
              マイ ガレージ
            </h1>
          </div>
          <div className="garage-header-actions">
            <button type="button" className="garage-back-button" onClick={onBackToWriting}>
              かく へ もどる
            </button>
          </div>
        </div>

        <p className="garage-progress-label">ぜんぶの くるま</p>
        <p
          className="garage-count"
          aria-label={`${completedCollectionCount}だい / ぜんぶ${totalCollectionCount}だい`}
        >
          {completedCollectionCount} / {totalCollectionCount}
        </p>
        <div
          className="garage-progress-bar"
          role="progressbar"
          aria-valuenow={completedCollectionCount}
          aria-valuemin={0}
          aria-valuemax={totalCollectionCount}
        >
          <span
            className="garage-progress-bar-fill"
            style={{
              width: `${(completedCollectionCount / totalCollectionCount) * 100}%`,
            }}
          />
        </div>
      </header>

      <div className="garage-tab-panel">
        <div className="garage-tabs" role="tablist" aria-label="くるまの しゅるい">
          <button
            type="button"
            role="tab"
            id="garage-tab-tier1"
            className={`garage-tab${activeTab === 'tier1' ? ' garage-tab--active' : ''}`}
            aria-selected={activeTab === 'tier1'}
            aria-controls="garage-tabpanel-tier1"
            onClick={() => handleTabSelect('tier1')}
          >
            がいこくしゃ
          </button>
          <button
            type="button"
            role="tab"
            id="garage-tab-tier2"
            className={`garage-tab${activeTab === 'tier2' ? ' garage-tab--active' : ''}${tier2Unlocked ? '' : ' garage-tab--locked'}`}
            aria-selected={activeTab === 'tier2'}
            aria-controls="garage-tabpanel-tier2"
            onClick={() => handleTabSelect('tier2')}
          >
            {!tier2Unlocked && <span className="garage-tab-lock" aria-hidden="true">🔒</span>}
            にほんしゃ
          </button>
          <button
            type="button"
            role="tab"
            id="garage-tab-special"
            className={`garage-tab garage-tab--special${activeTab === 'special' ? ' garage-tab--active' : ''}`}
            aria-selected={activeTab === 'special'}
            aria-controls="garage-tabpanel-special"
            onClick={() => handleTabSelect('special')}
          >
            ✦ スペシャル
          </button>
        </div>

        {activeTab === 'special' ? (
          <section
            className="garage-tab-content garage-special-panel"
            role="tabpanel"
            id="garage-tabpanel-special"
            aria-labelledby="garage-tab-special"
          >
            <p className="garage-special-kicker">SPECIAL CHALLENGE</p>
            <h2>10だいごとの とくべつな ごほうび！</h2>
            <p className="garage-special-count">
              {getUnlockedSpecialCarCount(progress)} / {SPECIAL_CAR_COUNT} だい
            </p>
            <div className="garage-special-grid">
              {specialChallenges.map((challenge) => {
                const challengeProgress = progress.specialChallenges[challenge.id] ?? {
                  completedCharacters: [],
                  unlocked: false,
                };
                const available =
                  completedCarCount >= challenge.unlockAtCarCount;
                const remaining = Math.max(
                  0,
                  challenge.unlockAtCarCount - completedCarCount,
                );

                return (
                  <div
                    key={challenge.id}
                    className={`garage-special-card${available ? ' is-available' : ''}${challengeProgress.unlocked ? ' is-complete' : ''}`}
                  >
                    <p className="garage-special-level">
                      {challenge.unlockAtCarCount}だい きねん
                    </p>
                    <div className="garage-special-card-image">
                      <CarImage
                        imagePath={challenge.car.imagePath}
                        manufacturer={challenge.car.manufacturer}
                        carName={challenge.car.name}
                        variant="default"
                      />
                    </div>
                    {challengeProgress.unlocked ? (
                      <>
                        <p className="garage-special-maker">{challenge.car.manufacturer}</p>
                        <h3>{challenge.car.name}</h3>
                        <p className="garage-special-status">✦ SPECIAL CAR GET! ✦</p>
                        <button
                          type="button"
                          onClick={() => onOpenSpecialChallenge(challenge.id)}
                        >
                          くるまを みる
                        </button>
                      </>
                    ) : available ? (
                      <>
                        <h3>きんいろの ゲートが ひらいた！</h3>
                        <p>「{challenge.word}」の 5もじに ちょうせんしよう</p>
                        <button
                          type="button"
                          onClick={() => onOpenSpecialChallenge(challenge.id)}
                        >
                          ちょうせんする！
                        </button>
                      </>
                    ) : (
                      <>
                        <h3>あと {remaining}だい</h3>
                        <p>
                          くるまを {challenge.unlockAtCarCount}だい
                          あつめると ひらくよ！
                        </p>
                        <div
                          className="garage-special-progress"
                          role="progressbar"
                          aria-valuenow={completedCarCount}
                          aria-valuemin={0}
                          aria-valuemax={challenge.unlockAtCarCount}
                        >
                          <span
                            style={{
                              width: `${Math.min(
                                100,
                                (completedCarCount /
                                  challenge.unlockAtCarCount) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
        <section
          className="garage-tab-content"
          role="tabpanel"
          id={`garage-tabpanel-${activeTab}`}
          aria-labelledby={`garage-tab-${activeTab}`}
        >
          <div className="garage-tab-summary">
            <p className="garage-tab-count">
              {activeCompleted} / {activeTotal} だい
            </p>
            {activeTab === 'tier2' && !tier2Unlocked && (
              <p className="garage-tab-lock-note">
                がいこくしゃを 100だい あつめると ひらくよ！
              </p>
            )}
          </div>

          <div className="garage-grid" role="list">
            {activeCars.map((car, index) =>
              renderCarCard(car, activeCollectionOffset + index + 1),
            )}
          </div>
        </section>
        )}
      </div>

      {detailCar && (
        <CarDetailModal
          car={detailCar}
          progress={progress}
          collectionNumber={detailCollectionNumber}
          isDebugMode={isDebugMode}
          onClose={() => setDetailCar(null)}
          imagePreviewState={carImagePreview}
        />
      )}
    </div>
  );
}
