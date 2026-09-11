import { badges, getBadgeById } from '../data/badges';
import './BadgeCollection.css';

type BadgeCollectionProps = {
  earnedBadgeIds: string[];
  onClose: () => void;
};

/** バッジ一覧 */
export function BadgeCollection({ earnedBadgeIds, onClose }: BadgeCollectionProps) {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <div className="badge-collection-overlay" role="dialog" aria-modal="true">
      <div className="badge-collection-panel">
        <div className="badge-collection-header">
          <h2 className="badge-collection-title">バッジ</h2>
          <button type="button" className="badge-collection-close" onClick={onClose}>
            とじる
          </button>
        </div>
        <div className="badge-collection-grid">
          {badges.map((badge) => {
            const earned = earnedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-item ${earned ? 'earned' : 'locked'}`}
              >
                <span className="badge-item-icon" aria-hidden="true">
                  {earned ? badge.icon : '？'}
                </span>
                <p className="badge-item-name">
                  {earned ? badge.name : badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** バッジ獲得演出 */
export function BadgeUnlockOverlay({
  badgeIds,
  onDismiss,
}: {
  badgeIds: string[];
  onDismiss: () => void;
}) {
  if (badgeIds.length === 0) return null;

  return (
    <div className="badge-unlock-overlay" role="dialog" aria-modal="true">
      <div className="badge-unlock-card" aria-live="polite">
        <p className="badge-unlock-title">バッジを ゲット！</p>
        {badgeIds.map((id) => {
          const badge = getBadgeById(id);
          if (!badge) return null;
          return (
            <div key={id} className="badge-unlock-item">
              <span className="badge-unlock-icon">{badge.icon}</span>
              <p className="badge-unlock-name">{badge.name}</p>
            </div>
          );
        })}
        <button type="button" className="badge-unlock-button" onClick={onDismiss}>
          つぎへ
        </button>
      </div>
    </div>
  );
}
