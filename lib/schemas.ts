import { z } from "zod";
import { EVENT_KINDS, EXCEPTION_STATUSES, EXCEPTION_TYPES, RELATIONSHIPS, SOURCES } from "./types";

export const ledgerEventSchema = z.object({
  id: z.string().min(1),
  source: z.enum(SOURCES),
  kind: z.enum(EVENT_KINDS),
  amount: z.number().int(),
  currency: z.string().min(1),
  grossAmount: z.number().int().optional(),
  feeAmount: z.number().int().optional(),
  netAmount: z.number().int().optional(),
  occurredAt: z.string().min(1),
  settledAt: z.string().optional(),
  externalRef: z.string().optional(),
  parentRef: z.string().optional(),
  payoutRef: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
});

export const matchEdgeSchema = z.object({
  id: z.string(),
  fromEventId: z.string(),
  toEventId: z.string(),
  relationship: z.enum(RELATIONSHIPS),
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  status: z.enum(["auto", "review", "approved", "rejected"]),
  policyId: z.string().optional(),
  crossPeriod: z.boolean(),
});

export const evidenceSchema = z.object({
  kind: z.enum(["event", "reference", "amount", "policy", "invariant", "metadata", "tool"]),
  label: z.string(),
  detail: z.string(),
  eventId: z.string().optional(),
});

export const agentRecommendationSchema = z.object({
  recommendation: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(evidenceSchema),
  requiresHumanReview: z.boolean(),
  proposedEdgeId: z.string().optional(),
});

export const dodoWebhookSchema = z.object({
  type: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const reviewActionSchema = z.object({
  exceptionId: z.string(),
  action: z.enum(["approve", "reject", "unresolved"]),
});

export const exceptionTypeSchema = z.enum(EXCEPTION_TYPES);
export const exceptionStatusSchema = z.enum(EXCEPTION_STATUSES);
