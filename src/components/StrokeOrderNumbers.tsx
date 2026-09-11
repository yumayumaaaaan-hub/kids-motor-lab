import type { ReferenceStroke } from '../types/strokeData';
import type { WritingViewBox } from '../utils/writingViewBox';
import { normalizedToViewBoxPoint } from '../utils/writingViewBox';
import './StrokeOrderNumbers.css';

type StrokeOrderNumbersProps = {
  visible: boolean;
  referenceStrokes: ReferenceStroke[];
  viewBox: WritingViewBox;
};

function toDisplayPercent(
  point: { x: number; y: number },
  viewBox: WritingViewBox,
): { left: string; top: string } {
  const { x, y } = normalizedToViewBoxPoint(point, viewBox);
  return {
    left: `${((x - viewBox.minX) / viewBox.size) * 100}%`,
    top: `${((y - viewBox.minY) / viewBox.size) * 100}%`,
  };
}

/** 各画の始点に書き順番号（1, 2, 3…）を表示 */
export function StrokeOrderNumbers({
  visible,
  referenceStrokes,
  viewBox,
}: StrokeOrderNumbersProps) {
  if (!visible || referenceStrokes.length === 0) {
    return null;
  }

  return (
    <div className="stroke-order-numbers" aria-hidden="true">
      {referenceStrokes.map((stroke, index) => {
        const position = toDisplayPercent(
          stroke.labelPoint ?? stroke.start,
          viewBox,
        );
        return (
          <span
            key={index}
            className="stroke-order-number"
            style={position}
          >
            {index + 1}
          </span>
        );
      })}
    </div>
  );
}
