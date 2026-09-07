export const EVENT_KINDS = [
  "sale",
  "fee",
  "refund",
  "dispute",
  "fx_conversion",
  "payout",
  "bank_deposit",
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export const SOURCES = ["stripe", "gumroad", "dodo", "bank"] as const;
export type Source = (typeof SOURCES)[number];

export const RELATIONSHIPS = [
  "belongs_to",
  "refunds",
  "disputes",
  "settles_into",
  "converts_into",
  "deposited_as",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export const EDGE_STATUSES = ["auto", "review", "approved", "rejected"] as const;
export type EdgeStatus = (typeof EDGE_STATUSES)[number];

export const EXCEPTION_TYPES = [
  "ambiguous_match",
  "unbalanced_payout",
  "missing_reference",
  "cross_period_adjustment",
  "unexpected_fx",
  "possible_duplicate",
  "unmatched_bank_deposit",
  "unknown",
] as const;

export type ExceptionType = (typeof EXCEPTION_TYPES)[number];

export const EXCEPTION_STATUSES = ["open", "approved", "rejected", "unresolved"] as const;
export type ExceptionStatus = (typeof EXCEPTION_STATUSES)[number];

export interface LedgerEvent {
  id: string;
  source: Source;
  kind: EventKind;
  amount: number;
  currency: string;
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  occurredAt: string;
  settledAt?: string;
  externalRef?: string;
  parentRef?: string;
  payoutRef?: string;
  description?: string;
  metadata: Record<string, unknown>;
}

export interface MatchEdge {
  id: string;
  fromEventId: string;
  toEventId: string;
  relationship: Relationship;
  confidence: number;
  reasons: string[];
  status: EdgeStatus;
  policyId?: string;
  crossPeriod: boolean;
}

export interface Evidence {
  kind: "event" | "reference" | "amount" | "policy" | "invariant" | "metadata" | "tool";
  label: string;
  detail: string;
  eventId?: string;
}

export interface ExceptionRecord {
  id: string;
  type: ExceptionType;
  summary: string;
  relatedEventIds: string[];
  candidateEdgeIds: string[];
  recommendation: string;
  confidence: number;
  evidence: Evidence[];
  status: ExceptionStatus;
  agentRecommendation?: AgentRecommendation;
  validation?: FinancialValidation;
}

export interface AgentRecommendation {
  recommendation: string;
  confidence: number;
  evidence: Evidence[];
  requiresHumanReview: boolean;
  proposedEdgeId?: string;
}

export interface PolicyCondition {
  type: "exact_parent_ref" | "exact_payout_ref" | "same_currency" | "cross_period_allowed" | "same_source";
}

export interface ReconciliationPolicy {
  id: string;
  source: Source;
  eventKind: EventKind;
  relationship: Relationship;
  conditions: PolicyCondition[];
  action: string;
  createdFromExceptionId?: string;
  createdFromDecisionId?: string;
  createdAt: string;
}

export interface HumanDecision {
  id: string;
  exceptionId: string;
  action: "approve" | "reject" | "unresolved";
  edgeId?: string;
  policyId?: string;
  decidedAt: string;
}

export interface InvalidRow {
  id: string;
  source: Source;
  raw: Record<string, unknown>;
  errors: string[];
}

export interface FinancialValidation {
  payoutEventId?: string;
  expectedMinor: number;
  actualMinor: number;
  residualMinor: number;
  balanced: boolean;
  components: {
    sales: number;
    refunds: number;
    disputes: number;
    fees: number;
    fxAdjustments: number;
  };
}

export interface GroundTruthEdge {
  fromEventId: string;
  toEventId: string;
  relationship: Relationship;
}

export interface ImportResult {
  events: LedgerEvent[];
  invalidRows: InvalidRow[];
}

export interface ReconciliationRun {
  id: string;
  ranAt: string;
  eventCount: number;
  edgeCount: number;
  exceptionCount: number;
  autoCount: number;
  reviewCount: number;
  archived?: boolean;
}

export interface RunArchive {
  run: ReconciliationRun;
  events: LedgerEvent[];
  invalidRows: InvalidRow[];
  edges: MatchEdge[];
  exceptions: ExceptionRecord[];
  policies: ReconciliationPolicy[];
  decisions: HumanDecision[];
  groundTruth: GroundTruthEdge[];
}

export interface OverviewMetrics {
  totalFinancialValue: number;
  reconciledValue: number;
  unresolvedValue: number;
  autonomousCoverage: number;
  transactionCount: number;
  payoutCount: number;
  bankDepositCount: number;
  exceptionCount: number;
  humanReviewCount: number;
}

export interface EvaluationMetrics {
  precision: number;
  recall: number;
  payoutCoverage: number;
  residualAmount: number;
  falseAutoMatchCount: number;
  falseAutoMatchRate: number;
  humanReviewCount: number;
  autonomousReconciliationCoverage: number;
  predictedCount: number;
  truthCount: number;
  correctCount: number;
}
