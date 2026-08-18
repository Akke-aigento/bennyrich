export function Diamond({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      style={{ display: "inline-block" }}
    >
      <rect
        x="10"
        y="2"
        width="11.3"
        height="11.3"
        transform="rotate(45 10 2)"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1"
      />
    </svg>
  );
}