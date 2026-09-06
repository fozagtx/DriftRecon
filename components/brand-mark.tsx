import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  size?: "sm" | "md";
};

export function BrandMark({ href = "/", size = "md" }: BrandMarkProps) {
  const mark = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const word = size === "sm" ? "text-[15px]" : "text-base";

  const inner = (
    <>
      <svg viewBox="0 0 512 512" className={`${mark} shrink-0`} aria-hidden>
        <rect width="512" height="512" rx="112" fill="#1A1A1C" />
        <path
          fill="#ECECE8"
          d="M156 128h124c76 0 128 50 128 128s-52 128-128 128H156V128zm56 52v152h68c42 0 70-30 70-76s-28-76-70-76h-68z"
        />
        <g transform="translate(256 248) rotate(-39.05)">
          <rect x="-198" y="-28" width="396" height="56" rx="28" fill="#0C0C0D" />
          <rect x="-198" y="-12" width="396" height="24" rx="12" fill="#D89B3A" />
        </g>
      </svg>
      <span className={`${word} font-semibold tracking-[0.16em]`}>DRIF</span>
    </>
  );

  if (!href) return <span className="inline-flex items-center gap-2.5">{inner}</span>;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="DRIF"
    >
      {inner}
    </Link>
  );
}
