export const AUTO_MIN = 0.95;
export const REVIEW_MIN = 0.7;

export function confidenceBand(confidence: number): "auto" | "review" | "unresolved" {
  if (confidence >= AUTO_MIN) return "auto";
  if (confidence >= REVIEW_MIN) return "review";
  return "unresolved";
}

export const EXACT_CONFIDENCE = 1;
