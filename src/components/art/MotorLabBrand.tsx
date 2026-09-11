import { ART } from '../../art/paths';
import './MotorLabBrand.css';

type MotorLabBrandProps = {
  /** 起動画面・完成画面など中央配置 */
  centered?: boolean;
  /** エンブレムのみ */
  emblemOnly?: boolean;
  className?: string;
};

/** KIDS MOTOR LAB ブランド（エンブレム + テキスト） */
export function MotorLabBrand({
  centered = false,
  emblemOnly = false,
  className = '',
}: MotorLabBrandProps) {
  return (
    <div
      className={`motor-lab-brand ${centered ? 'motor-lab-brand--centered' : ''} ${className}`}
    >
      <img
        className="motor-lab-brand__emblem"
        src={ART.emblem}
        alt="KIDS MOTOR LABのシンボル"
        width={40}
        height={40}
        decoding="async"
      />
      {!emblemOnly && (
        <div className="motor-lab-brand__text">
          <span className="motor-lab-brand__title motor-lab-brand__title--full">
            KIDS MOTOR LAB
          </span>
          <span className="motor-lab-brand__title motor-lab-brand__title--short">
            MOTOR LAB
          </span>
          <span className="motor-lab-brand__accent" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
