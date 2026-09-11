import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ReferenceStroke } from '../types/strokeData';
import type { Stroke } from '../types';
import {
  DEFAULT_VIEW_BOX,
  loadWritingViewBox,
  normalizedToViewBoxPoint,
  viewBoxPointToNormalized,
  type WritingViewBox,
} from '../utils/writingViewBox';
import { StrokeGuideSvg } from './StrokeGuideSvg';
import { StrokeOrderNumbers } from './StrokeOrderNumbers';
import './WritingCanvas.css';

type WritingCanvasProps = {
  character: string;
  strokeSvgPath: string;
  strokes: Stroke[];
  showGuide: boolean;
  showStrokeOrder: boolean;
  helpMode: boolean;
  helpHint?: string;
  referenceStrokes: ReferenceStroke[];
  animateGuide: boolean;
  interactionDisabled?: boolean;
  onStrokeStart?: () => void;
  onStrokeComplete: (stroke: Stroke) => void;
  onAnimationComplete: () => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
};

export type WritingCanvasHandle = {
  cancelActiveStroke: () => void;
};

const STROKE_COLOR = '#1a3b5d';
const MIN_POINT_DISTANCE_SQ = 0.000015;
const MAX_DPR = 2;

/** 正方形の書き込みエリアを取得（Canvas 内部も常に正方形） */
function getWritingArea(canvas: HTMLCanvasElement) {
  const size = Math.min(canvas.width, canvas.height);
  return {
    size,
    offsetX: (canvas.width - size) / 2,
    offsetY: (canvas.height - size) / 2,
  };
}

/** 正規化座標（0〜1）を取得 */
function getNormalizedPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  viewBox: WritingViewBox,
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const { size, offsetX, offsetY } = getWritingArea(canvas);

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  const viewX = ((x - offsetX) / size) * viewBox.size + viewBox.minX;
  const viewY = ((y - offsetY) / size) * viewBox.size + viewBox.minY;
  const normalized = viewBoxPointToNormalized(viewX, viewY, viewBox);

  return {
    x: Math.max(0, Math.min(1, normalized.x)),
    y: Math.max(0, Math.min(1, normalized.y)),
  };
}

/** 正規化座標をキャンバスピクセルへ変換 */
function toCanvasPoint(
  point: { x: number; y: number },
  canvas: HTMLCanvasElement,
  viewBox: WritingViewBox,
) {
  const { size, offsetX, offsetY } = getWritingArea(canvas);
  const { x, y } = normalizedToViewBoxPoint(point, viewBox);

  return {
    x: ((x - viewBox.minX) / viewBox.size) * size + offsetX,
    y: ((y - viewBox.minY) / viewBox.size) * size + offsetY,
  };
}

function getLineWidth(canvas: HTMLCanvasElement): number {
  return Math.max(14, canvas.width * 0.035);
}

/** 1本の線を描く */
function drawStroke(
  context: CanvasRenderingContext2D,
  stroke: Stroke,
  lineWidth: number,
  color: string,
  viewBox: WritingViewBox,
) {
  if (stroke.length === 0) {
    return;
  }

  const canvas = context.canvas;
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();

  const first = toCanvasPoint(stroke[0], canvas, viewBox);
  context.moveTo(first.x, first.y);

  for (let index = 1; index < stroke.length; index += 1) {
    const point = toCanvasPoint(stroke[index], canvas, viewBox);
    context.lineTo(point.x, point.y);
  }

  context.stroke();
}

/** 2点間だけ線を引く（なぞり中の追記用） */
function drawStrokeSegment(
  context: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  lineWidth: number,
  viewBox: WritingViewBox,
) {
  const canvas = context.canvas;
  const start = toCanvasPoint(from, canvas, viewBox);
  const end = toCanvasPoint(to, canvas, viewBox);

  context.strokeStyle = STROKE_COLOR;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
}

/** おたすけ：始点・番号・矢印 */
function drawHelpMarkers(
  context: CanvasRenderingContext2D,
  referenceStrokes: ReferenceStroke[],
  viewBox: WritingViewBox,
) {
  const canvas = context.canvas;
  const width = canvas.width;

  referenceStrokes.forEach((stroke, index) => {
    const start = toCanvasPoint(stroke.start, canvas, viewBox);
    const end = toCanvasPoint(stroke.end, canvas, viewBox);

    context.fillStyle = '#2879c7';
    context.beginPath();
    context.arc(start.x, start.y, Math.max(8, width * 0.018), 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#ffffff';
    context.font = `700 ${Math.max(14, width * 0.024)}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(index + 1), start.x, start.y);

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = Math.max(18, width * 0.04);
    const midX = start.x + (end.x - start.x) * 0.35;
    const midY = start.y + (end.y - start.y) * 0.35;

    context.strokeStyle = '#f28c28';
    context.lineWidth = Math.max(3, width * 0.006);
    context.beginPath();
    context.moveTo(midX, midY);
    context.lineTo(
      midX + Math.cos(angle) * arrowLength,
      midY + Math.sin(angle) * arrowLength,
    );
    context.stroke();
  });
}

export const WritingCanvas = forwardRef<WritingCanvasHandle, WritingCanvasProps>(
  function WritingCanvas(
    {
      character,
      strokeSvgPath,
      strokes,
      showGuide,
      showStrokeOrder,
      helpMode,
      helpHint,
      referenceStrokes,
      animateGuide,
      interactionDisabled = false,
      onStrokeStart,
      onStrokeComplete,
      onAnimationComplete,
      onDrawingStateChange,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const committedCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const currentStrokeRef = useRef<Stroke>([]);
    const isDrawingRef = useRef(false);
    const activePointerIdRef = useRef<number | null>(null);
    const visibleStrokeCountRef = useRef(referenceStrokes.length);
    const writingViewBoxRef = useRef<WritingViewBox>(DEFAULT_VIEW_BOX);
    const [writingViewBox, setWritingViewBox] =
      useState<WritingViewBox>(DEFAULT_VIEW_BOX);

    useEffect(() => {
      let cancelled = false;

      loadWritingViewBox(strokeSvgPath).then((viewBox) => {
        if (cancelled) {
          return;
        }
        writingViewBoxRef.current = viewBox;
        setWritingViewBox(viewBox);
      });

      return () => {
        cancelled = true;
      };
    }, [strokeSvgPath]);

    /** 確定した線をオフスクリーンへ描画 */
    const rebuildCommittedLayer = useCallback(
      (targetCanvas: HTMLCanvasElement) => {
        const viewBox = writingViewBoxRef.current;
        if (!committedCanvasRef.current) {
          committedCanvasRef.current = document.createElement('canvas');
        }

        const committed = committedCanvasRef.current;
        if (
          committed.width !== targetCanvas.width ||
          committed.height !== targetCanvas.height
        ) {
          committed.width = targetCanvas.width;
          committed.height = targetCanvas.height;
        }

        const context = committed.getContext('2d');
        if (!context) {
          return;
        }

        context.clearRect(0, 0, committed.width, committed.height);

        if (helpMode && showGuide) {
          drawHelpMarkers(context, referenceStrokes, viewBox);
        }

        const lineWidth = getLineWidth(targetCanvas);
        strokes.forEach((stroke) => {
          drawStroke(context, stroke, lineWidth, STROKE_COLOR, viewBox);
        });
      },
      [helpMode, referenceStrokes, showGuide, strokes],
    );

    /** 確定線＋なぞり中の線を表示 */
    const paintFrame = useCallback(
      (includeLiveStroke: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const viewBox = writingViewBoxRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
          return;
        }

        rebuildCommittedLayer(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (committedCanvasRef.current) {
          context.drawImage(committedCanvasRef.current, 0, 0);
        }

        if (includeLiveStroke && currentStrokeRef.current.length > 0) {
          const lineWidth = getLineWidth(canvas);
          drawStroke(
            context,
            currentStrokeRef.current,
            lineWidth,
            STROKE_COLOR,
            viewBox,
          );
        }
      },
      [rebuildCommittedLayer],
    );

    const cancelActiveStroke = useCallback(() => {
      const canvas = canvasRef.current;
      if (canvas && activePointerIdRef.current !== null) {
        try {
          if (canvas.hasPointerCapture(activePointerIdRef.current)) {
            canvas.releasePointerCapture(activePointerIdRef.current);
          }
        } catch {
          /* pointer already released */
        }
      }
      isDrawingRef.current = false;
      activePointerIdRef.current = null;
      currentStrokeRef.current = [];
      onDrawingStateChange?.(false);
      paintFrame(false);
    }, [onDrawingStateChange, paintFrame]);

    useImperativeHandle(ref, () => ({ cancelActiveStroke }), [cancelActiveStroke]);

    useEffect(() => {
      const handleOrientation = () => {
        cancelActiveStroke();
      };
      window.addEventListener('orientationchange', handleOrientation);
      return () => {
        window.removeEventListener('orientationchange', handleOrientation);
      };
    }, [cancelActiveStroke]);

    useEffect(() => {
      if (!animateGuide) {
        visibleStrokeCountRef.current = referenceStrokes.length;
        return;
      }

      visibleStrokeCountRef.current = 0;
      let frame = 0;
      const timer = window.setInterval(() => {
        frame += 1;
        visibleStrokeCountRef.current = frame;
        if (frame >= referenceStrokes.length) {
          window.clearInterval(timer);
          onAnimationComplete();
        }
      }, 700);

      return () => {
        window.clearInterval(timer);
      };
    }, [animateGuide, referenceStrokes.length, onAnimationComplete]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const stage = canvas.closest('.writing-canvas-stage') as HTMLElement | null;
      const parent = stage ?? canvas.parentElement;
      if (!parent) {
        return;
      }

      let retryTimer: number | undefined;

      const resizeCanvas = () => {
        const rect = parent.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(resizeCanvas, 120);
          return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const displaySize = Math.max(1, Math.min(rect.width, rect.height));
        const nextSize = Math.max(1, Math.floor(displaySize * dpr));

        if (canvas.width !== nextSize || canvas.height !== nextSize) {
          canvas.width = nextSize;
          canvas.height = nextSize;
        }

        paintFrame(isDrawingRef.current);
      };

      const scheduleResize = () => {
        window.requestAnimationFrame(resizeCanvas);
      };

      resizeCanvas();
      const observer = new ResizeObserver(scheduleResize);
      observer.observe(parent);

      let ancestor: Element | null = parent;
      for (let depth = 0; depth < 5 && ancestor; depth += 1) {
        observer.observe(ancestor);
        ancestor = ancestor.parentElement;
      }

      window.addEventListener('orientationchange', scheduleResize);
      window.addEventListener('resize', scheduleResize);
      document.addEventListener('visibilitychange', scheduleResize);

      return () => {
        observer.disconnect();
        window.clearTimeout(retryTimer);
        window.removeEventListener('orientationchange', scheduleResize);
        window.removeEventListener('resize', scheduleResize);
        document.removeEventListener('visibilitychange', scheduleResize);
      };
    }, [paintFrame]);

    /** 文字が変わったら描画状態をリセット（前の文字の線を残さない） */
    useEffect(() => {
      isDrawingRef.current = false;
      activePointerIdRef.current = null;
      currentStrokeRef.current = [];
      paintFrame(false);
    }, [character, strokeSvgPath, paintFrame]);

    useEffect(() => {
      const includeLiveStroke =
        isDrawingRef.current && currentStrokeRef.current.length > 0;
      paintFrame(includeLiveStroke);
    }, [paintFrame, strokes, helpMode, showGuide, referenceStrokes, writingViewBox]);

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (interactionDisabled) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas || isDrawingRef.current) {
        return;
      }

      if (
        activePointerIdRef.current !== null &&
        activePointerIdRef.current !== event.pointerId
      ) {
        return;
      }

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      activePointerIdRef.current = event.pointerId;
      onDrawingStateChange?.(true);
      onStrokeStart?.();

      const point = getNormalizedPoint(
        canvas,
        event.clientX,
        event.clientY,
        writingViewBoxRef.current,
      );
      currentStrokeRef.current = [point];
      paintFrame(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (
        !canvas ||
        !isDrawingRef.current ||
        activePointerIdRef.current !== event.pointerId
      ) {
        return;
      }

      event.preventDefault();

      const point = getNormalizedPoint(
        canvas,
        event.clientX,
        event.clientY,
        writingViewBoxRef.current,
      );
      const stroke = currentStrokeRef.current;
      const last = stroke[stroke.length - 1];
      if (last) {
        const dx = point.x - last.x;
        const dy = point.y - last.y;
        if (dx * dx + dy * dy < MIN_POINT_DISTANCE_SQ) {
          return;
        }
      }

      stroke.push(point);

      const context = canvas.getContext('2d');
      if (!context || !last) {
        return;
      }

      drawStrokeSegment(
        context,
        last,
        point,
        getLineWidth(canvas),
        writingViewBoxRef.current,
      );
    };

    const finishStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (
        !canvas ||
        !isDrawingRef.current ||
        activePointerIdRef.current !== event.pointerId
      ) {
        return;
      }

      event.preventDefault();

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      const completedStroke = [...currentStrokeRef.current];
      currentStrokeRef.current = [];
      isDrawingRef.current = false;
      activePointerIdRef.current = null;
      onDrawingStateChange?.(false);

      if (completedStroke.length > 0) {
        onStrokeComplete(completedStroke);
      } else {
        paintFrame(false);
      }
    };

    return (
      <div
        className={`writing-canvas-wrap ${interactionDisabled ? 'writing-canvas-wrap--disabled' : ''} ${helpMode ? 'writing-canvas-wrap--help' : ''}`}
      >
        <div className="writing-canvas-square">
          <div className="writing-canvas-mission" aria-live="polite">
            {helpMode && (
              <span className="writing-canvas-mission__assist">おたすけ中</span>
            )}
            <span className="writing-canvas-mission__label">
              「<span className="writing-canvas-mission__char">{character}</span>
              」を かこう！
            </span>
            {helpMode && helpHint && (
              <span className="writing-canvas-mission__hint">{helpHint}</span>
            )}
          </div>
          <div className="writing-canvas-stage">
            <div className="writing-canvas-content">
              <StrokeGuideSvg
                svgPath={strokeSvgPath}
                character={character}
                visible={showGuide}
                helpMode={helpMode}
                visibleStrokeCount={
                  animateGuide
                    ? visibleStrokeCountRef.current
                    : referenceStrokes.length
                }
                viewBox={writingViewBox}
              />
              <StrokeOrderNumbers
                visible={showStrokeOrder}
                referenceStrokes={referenceStrokes}
                viewBox={writingViewBox}
              />
              <canvas
                ref={canvasRef}
                className="writing-canvas"
                aria-label={`${character} を書く練習エリア`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
                onPointerLeave={finishStroke}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
