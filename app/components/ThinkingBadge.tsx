export function ThinkingBadge({ label = "Thinking" }: { label?: string }) {
  return (
    <span className="thinking-shimmer font-serif text-3xl select-none">
      {label}…
    </span>
  );
}
