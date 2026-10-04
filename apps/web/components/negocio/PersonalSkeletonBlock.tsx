interface PersonalSkeletonBlockProps { className?: string }
export function PersonalSkeletonBlock({ className = "" }: PersonalSkeletonBlockProps) {
  return <div className={`bg-surface-alt rounded ${className}`} />;
}
