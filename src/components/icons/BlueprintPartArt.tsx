/** 設計図パーツ用の汎用車線画（3分割） */
export function BlueprintPartArt({ part }: { part: 'front' | 'middle' | 'rear' }) {
  if (part === 'front') {
    return (
      <svg viewBox="0 0 80 40" className="blueprint-part-art" aria-hidden="true">
        <path
          d="M8 28 L18 14 H42 L52 28 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="46" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M22 18 H36" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }
  if (part === 'middle') {
    return (
      <svg viewBox="0 0 80 40" className="blueprint-part-art" aria-hidden="true">
        <path
          d="M6 28 H74"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="14"
          y="14"
          width="52"
          height="12"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="20" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 40" className="blueprint-part-art" aria-hidden="true">
      <path
        d="M28 28 L38 14 H62 L72 28 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="62" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="48" y="16" width="10" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export const blueprintPartLabels = ['まえ', 'まんなか', 'うしろ'] as const;
export const blueprintPartTypes = ['front', 'middle', 'rear'] as const;
