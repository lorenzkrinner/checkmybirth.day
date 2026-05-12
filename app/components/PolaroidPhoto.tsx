export function PolaroidPhoto({
  url,
  caption,
  source,
  className,
  style,
}: {
  url: string;
  caption: string;
  source: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`absolute z-20 hidden md:block bg-white pt-3 pb-10 px-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] ${className ?? ""}`}
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={caption}
          className="w-full h-full object-cover sepia-[.3] saturate-150 contrast-110 hue-rotate-[-10deg]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center text-stone-700 font-serif text-lg leading-tight px-1 line-clamp-2 hover:underline"
      >
        {caption}
      </a>
    </div>
  );
}
