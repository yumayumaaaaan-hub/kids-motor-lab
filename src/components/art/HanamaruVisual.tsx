import { ART } from '../../art/paths';
import './HanamaruVisual.css';

type HanamaruVisualProps = {
  /** 結果画面 / 小 / 極小 */
  size?: 'hero' | 'small' | 'tiny';
  /** 主情報として読み上げる */
  decorative?: boolean;
  className?: string;
};

/** はなまる報酬画像 */
export function HanamaruVisual({
  size = 'hero',
  decorative = false,
  className = '',
}: HanamaruVisualProps) {
  return (
    <img
      className={`hanamaru-visual hanamaru-visual--${size} ${className}`}
      src={ART.hanamaruReward}
      alt={decorative ? '' : 'はなまる'}
      aria-hidden={decorative ? true : undefined}
      decoding="async"
    />
  );
}
