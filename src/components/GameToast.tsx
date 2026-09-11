import { useEffect } from 'react';
import { animationConfig } from '../config/animationConfig';
import './GameToast.css';

type GameToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
};

/** 短い案内トースト（けす→もとにもどす 等） */
export function GameToast({
  message,
  actionLabel,
  onAction,
  onDismiss,
}: GameToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, animationConfig.toastHide);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="game-toast" role="status" aria-live="polite">
      <span className="game-toast-message">{message}</span>
      {actionLabel && onAction && (
        <button type="button" className="game-toast-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
