import { formatMinor } from "@/lib/money";

export function Money({
  minor,
  currency,
  className = "",
}: {
  minor: number | null | undefined;
  currency: string;
  className?: string;
}) {
  const label = formatMinor(minor, currency);
  return (
    <span className={`font-mono tabular-nums ${className}`} aria-label={label}>
      {label}
    </span>
  );
}

export function Percent({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className="font-mono tabular-nums">--</span>;
  }
  const label = `${(value * 100).toFixed(1)}%`;
  return <span className="font-mono tabular-nums">{label}</span>;
}
