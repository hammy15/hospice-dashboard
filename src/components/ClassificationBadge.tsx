'use client';

interface ClassificationBadgeProps {
  classification: 'GREEN' | 'YELLOW' | 'RED';
  size?: 'sm' | 'md' | 'lg';
}

export function ClassificationBadge({ classification, size = 'md' }: ClassificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const badgeClass = {
    GREEN: 'badge-green',
    YELLOW: 'badge-yellow',
    RED: 'badge-red',
  };

  return (
    <span className={`${badgeClass[classification]} ${sizeClasses[size]} rounded-full font-semibold inline-flex items-center gap-1.5`}>
      <span className={`w-2 h-2 rounded-full ${
        classification === 'GREEN' ? 'bg-emerald-400' :
        classification === 'YELLOW' ? 'bg-amber-400' : 'bg-red-400'
      } animate-pulse`} />
      {classification}
    </span>
  );
}
