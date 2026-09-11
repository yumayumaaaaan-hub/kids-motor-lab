import { useEffect, useState } from 'react';
import { prepareGuideSvgForPath } from '../utils/strokeGuideSvg';
import type { WritingViewBox } from '../utils/writingViewBox';
import './StrokeGuideSvg.css';

type StrokeGuideSvgProps = {
  svgPath: string;
  character: string;
  visible: boolean;
  helpMode: boolean;
  visibleStrokeCount: number;
  viewBox: WritingViewBox;
};

/** ブラウザのSVG描画でお手本を表示（clip-path付きデータを正しく描く） */
export function StrokeGuideSvg({
  svgPath,
  character,
  visible,
  helpMode,
  visibleStrokeCount,
  viewBox,
}: StrokeGuideSvgProps) {
  const [guideMarkup, setGuideMarkup] = useState('');

  useEffect(() => {
    let cancelled = false;

    prepareGuideSvgForPath(svgPath, `guide-${character}`, {
      helpMode,
      visibleStrokeCount,
    }, viewBox)
      .then((markup) => {
        if (!cancelled) {
          setGuideMarkup(markup);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGuideMarkup('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [svgPath, character, helpMode, visibleStrokeCount, viewBox]);

  if (!visible || !guideMarkup) {
    return null;
  }

  return (
    <div
      className="stroke-guide-svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: guideMarkup }}
    />
  );
}
