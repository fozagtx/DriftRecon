const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND"]);

export const DEMO_TOLERANCE_MINOR = 1;

export function currencyDecimals(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2;
}

export function parseAmountInput(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value;
  }
  const text = String(value).trim();
  if (text === "") return null;
  const normalized = text.replace(/[$,]/g, "");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function toMinorUnits(value: unknown, currency: string): number {
  const parsed = parseAmountInput(value);
  if (parsed === null) {
    throw new Error("Missing amount cannot be invented");
  }
  const decimals = currencyDecimals(currency);
  return Math.round(parsed * 10 ** decimals);
}

export function tryToMinorUnits(value: unknown, currency: string): number | null {
  try {
    return toMinorUnits(value, currency);
  } catch {
    return null;
  }
}

export function fromMinorUnits(minor: number, currency: string): number {
  const decimals = currencyDecimals(currency);
  return minor / 10 ** decimals;
}

export function absMinor(minor: number): number {
  return Math.abs(minor);
}

export function withinTolerance(left: number, right: number, tolerance = DEMO_TOLERANCE_MINOR): boolean {
  return Math.abs(left - right) <= tolerance;
}

export function formatMinor(minor: number | null | undefined, currency: string): string {
  if (minor === null || minor === undefined || !Number.isFinite(minor)) return "--";
  if (Object.is(minor, -0) || minor === 0) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: currencyDecimals(currency),
      maximumFractionDigits: currencyDecimals(currency),
    }).format(0);
  }
  const signed = minor < 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: currencyDecimals(currency),
    maximumFractionDigits: currencyDecimals(currency),
  }).format(fromMinorUnits(Math.abs(minor), currency));
  return signed ? `-${formatted}` : formatted;
}
