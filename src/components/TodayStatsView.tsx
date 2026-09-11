import type { TodayStats } from '../types/gameProgress';
import { HanamaruVisual } from './art/HanamaruVisual';
import './TodayStatsView.css';
import './art/HanamaruVisual.css';

type TodayStatsViewProps = {
  stats: TodayStats;
};

/** 今日のプレイ結果 */
export function TodayStatsView({ stats }: TodayStatsViewProps) {
  return (
    <div className="today-stats">
      <p className="today-stats-title">きょうの きろく</p>
      <ul className="today-stats-list">
        <li>かいた　{stats.attempts}かい</li>
        <li>できた　{stats.passed}こ</li>
        <li className="today-stats-hanamaru">
          <HanamaruVisual size="tiny" decorative />
          はなまる　{stats.excellent}こ
        </li>
      </ul>
    </div>
  );
}
