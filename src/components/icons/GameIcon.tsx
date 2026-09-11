type IconProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = { sm: 16, md: 20, lg: 24 };

function IconBase({
  children,
  size = 'md',
  className = '',
}: IconProps & { children: React.ReactNode }) {
  const px = sizes[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`game-icon ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconGarage(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10 L12 3 L21 10 V20 H3 Z" />
      <rect x="8" y="14" width="8" height="6" rx="1" />
    </IconBase>
  );
}

export function IconUndo(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 7 L4 12 L9 17" />
      <path d="M4 12 H16 A5 5 0 0 1 16 22" />
    </IconBase>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7 H20 M8 7 V5 H16 V7 M7 7 L8 19 H16 L17 7" />
    </IconBase>
  );
}

export function IconGuide(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8 H16 M8 12 H14 M8 16 H12" />
    </IconBase>
  );
}

export function IconBlueprint(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="5" width="14" height="14" rx="1" />
      <path d="M5 11 H19 M11 5 V19" />
    </IconBase>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12 L11 15 L16 9" />
    </IconBase>
  );
}

export function IconHanamaru(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 6 L16 12 L10 18" />
    </IconBase>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20 L8 16 L17 7 L20 10 L11 19 Z" />
    </IconBase>
  );
}

export function IconStar({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  const px = sizes[props.size ?? 'md'];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={`game-icon ${props.className ?? ''}`}
      aria-hidden="true"
    >
      <path
        d="M12 3 L14.5 9 H21 L16 13 L18 20 L12 16 L6 20 L8 13 L3 9 H9.5 Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
