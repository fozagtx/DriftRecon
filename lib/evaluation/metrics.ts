import { absMinor } from "../money";
import { validatePayout } from "../reconciliation/invariants";
import type { EvaluationMetrics, GroundTruthEdge, LedgerEvent, MatchEdge } from "../types";

export function truthKey(edge: { fromEventId: string; toEventId: string; relationship: string }): string {
  return `${edge.fromEventId}|${edge.toEventId}|${edge.relationship}`;
}

export function evaluatePredictions(
  predicted: MatchEdge[],
  truth: GroundTruthEdge[],
  events: LedgerEvent[],
  reviewCount: number,
): EvaluationMetrics {
  const active = predicted.filter((edge) => edge.status !== "rejected");
  const truthKeys = new Set(truth.map(truthKey));
  const predictedKeys = active.map(truthKey);
  const correctCount = predictedKeys.filter((key) => truthKeys.has(key)).length;
  const auto = predicted.filter((edge) => edge.status === "auto");
  const falseAuto = auto.filter((edge) => !truthKeys.has(truthKey(edge)));
  const payouts = events.filter((event) => event.kind === "payout");
  const explained = payouts.filter((payout) => {
    const required = truth.filter((item) => item.relationship === "settles_into" && item.toEventId === payout.id);
    if (required.length === 0) return false;
    return required.every((item) => predictedKeys.includes(truthKey(item)));
  });
  const residualAmount = payouts.reduce((total, payout) => total + absMinor(validatePayout(payout, events, predicted).residualMinor), 0);
  const totalValue = payouts.reduce((total, payout) => total + payout.amount, 0) || 1;
  const autoCorrectValue = payouts
    .filter((payout) =>
      auto.some(
        (edge) =>
          edge.relationship === "deposited_as" &&
          edge.fromEventId === payout.id &&
          truthKeys.has(truthKey(edge)),
      ),
    )
    .reduce((total, payout) => total + payout.amount, 0);

  return {
    precision: active.length === 0 ? 0 : correctCount / active.length,
    recall: truth.length === 0 ? 0 : correctCount / truth.length,
    payoutCoverage: payouts.length === 0 ? 0 : explained.length / payouts.length,
    residualAmount,
    falseAutoMatchCount: falseAuto.length,
    falseAutoMatchRate: auto.length === 0 ? 0 : falseAuto.length / auto.length,
    humanReviewCount: reviewCount,
    autonomousReconciliationCoverage: autoCorrectValue / totalValue,
    predictedCount: active.length,
    truthCount: truth.length,
    correctCount,
  };
}
