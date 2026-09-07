# DriftRecon — Final Requirements

## 1. Product

| Item                 | Requirement                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| Product              | DriftRecon                                                                           |
| Track                | Autonomous Office of the CFO                                                         |
| Purpose              | Reconcile revenue from payment platforms to bank deposits                            |
| Core chain           | Sale → Fee / Refund / Dispute / FX → Payout → Bank Deposit                           |
| Cross-period support | Related events remain connected even when they occur in different accounting periods |
| Core rule            | **Code calculates. Agent investigates. Human decides uncertainty.**                  |

---

## 2. Technology

| Technology         | Usage                                |
| ------------------ | ------------------------------------ |
| SvelteKit          | Application and server routes        |
| TypeScript         | Application and reconciliation logic |
| Svelte 5           | Interface                            |
| Neon               | Persistence (Lakebase Postgres)      |
| Zod                | Input/output validation              |
| Svelte + SVG       | Transaction graph                    |
| TensorMux          | Recon Agent inference                |
| Neatlogs           | Agent tracing and observability      |
| Dodo Payments      | Payment-event source                 |
| Agent Orchestrator | Development orchestration            |

---

## 3. Data Sources

| Source        | Input   |
| ------------- | ------- |
| Stripe        | CSV     |
| Gumroad       | CSV     |
| Dodo Payments | Webhook |
| Bank          | CSV     |

Every source is normalized into the same `LedgerEvent` model.

---

## 4. Supported Events

| Event            | Supported |
| ---------------- | --------- |
| Sale             | Yes       |
| Fee              | Yes       |
| Full refund      | Yes       |
| Partial refund   | Yes       |
| Dispute          | Yes       |
| Chargeback       | Yes       |
| FX conversion    | Yes       |
| Processor payout | Yes       |
| Bank deposit     | Yes       |

```ts
type EventKind =
  | "sale"
  | "fee"
  | "refund"
  | "dispute"
  | "fx_conversion"
  | "payout"
  | "bank_deposit";
```

---

## 5. Canonical Event Model

```ts
interface LedgerEvent {
  id: string;

  source:
    | "stripe"
    | "gumroad"
    | "dodo"
    | "bank";

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
```

| Rule               | Requirement                                   |
| ------------------ | --------------------------------------------- |
| Unique ID          | Every normalized event gets a DriftRecon ID   |
| External reference | Original platform reference remains preserved |
| Metadata           | Original source metadata remains preserved    |
| Amount mutation    | Imported financial amounts are never changed  |
| Invalid rows       | Never silently discarded                      |

---

# 6. Reconciliation Pipeline

| Step | Action                              |
| ---- | ----------------------------------- |
| 1    | Import data                         |
| 2    | Validate input                      |
| 3    | Normalize events                    |
| 4    | Generate candidate relationships    |
| 5    | Apply exact-reference rules         |
| 6    | Apply approved policies             |
| 7    | Apply structured matching           |
| 8    | Build financial chains              |
| 9    | Validate financial invariants       |
| 10   | Auto-resolve safe matches           |
| 11   | Generate exceptions                 |
| 12   | Recon Agent investigates exceptions |
| 13   | Human reviews uncertain cases       |
| 14   | Save decision                       |
| 15   | Create approved policy              |
| 16   | Re-run reconciliation               |
| 17   | Evaluate against ground truth       |

---

# 7. Transaction Relationships

| Relationship    | Meaning                                           |
| --------------- | ------------------------------------------------- |
| `belongs_to`    | Event belongs to another financial group          |
| `refunds`       | Refund connects to original sale                  |
| `disputes`      | Dispute connects to original sale                 |
| `settles_into`  | Event settles into payout                         |
| `converts_into` | FX event converts one currency value into another |
| `deposited_as`  | Processor payout becomes bank deposit             |

```ts
interface MatchEdge {
  id: string;
  fromEventId: string;
  toEventId: string;

  relationship:
    | "belongs_to"
    | "refunds"
    | "disputes"
    | "settles_into"
    | "converts_into"
    | "deposited_as";

  confidence: number;
  reasons: string[];

  status:
    | "auto"
    | "review"
    | "approved"
    | "rejected";
}
```

---

# 8. Deterministic Matching

| Match Type                 | Confidence |
| -------------------------- | ---------: |
| Exact external reference   |       1.00 |
| Exact parent reference     |       1.00 |
| Exact payout reference     |       1.00 |
| Structured candidate match | Calculated |

Structured score:

```text
referenceScore × 0.40
+ amountScore × 0.25
+ timingScore × 0.15
+ currencyScore × 0.10
+ metadataScore × 0.10
```

---

# 9. Confidence Decisions

|      Confidence | Result                                           |
| --------------: | ------------------------------------------------ |
|   `0.95 – 1.00` | Automatic only after financial validation passes |
| `0.70 – 0.9499` | Human review                                     |
|        `< 0.70` | Unresolved                                       |

The AI agent cannot change these thresholds.

---

# 10. Financial Validation

All authoritative arithmetic runs in deterministic TypeScript.

```text
Σ Sales
- Σ Refunds
- Σ Disputes
- Σ Fees
± Σ FX Adjustments
=
Processor Payout
```

Then:

```text
Processor Payout ≈ Bank Deposit
```

| Rule              | Requirement           |
| ----------------- | --------------------- |
| Money storage     | Integer minor units   |
| Example           | `$10.50 = 1050`       |
| Demo tolerance    | `$0.01`               |
| LLM arithmetic    | Forbidden             |
| Unbalanced payout | Cannot auto-reconcile |
| Missing amount    | Cannot be invented    |

---

# 11. Cross-Period Rules

| Situation                            | Behavior       |
| ------------------------------------ | -------------- |
| June sale + July refund              | Stay connected |
| Sale and payout in different periods | Stay connected |
| Dispute after original sale month    | Stay connected |
| FX settlement in later period        | Stay connected |
| Chargeback in later period           | Stay connected |

Accounting-period boundaries do not invalidate legitimate economic relationships.

Cross-period relationships stay connected as candidates. They cannot auto-resolve until an approved policy covers the pattern.

---

# 12. Recon Agent

There is one runtime AI agent:

**Recon Agent**

| Agent Can                  | Agent Cannot                                |
| -------------------------- | ------------------------------------------- |
| Inspect events             | Change amounts                              |
| Inspect candidate matches  | Invent transactions                         |
| Compare descriptions       | Invent evidence                             |
| Inspect references         | Perform authoritative accounting arithmetic |
| Inspect metadata           | Override invariant failures                 |
| Retrieve approved policies | Approve its own review case                 |
| Rank ambiguous candidates  | Change confidence thresholds                |
| Explain relationships      | Mark unbalanced payout as reconciled        |
| Recommend a match          | Generate arbitrary executable code          |
| Request human review       | Silently resolve uncertainty                |

---

# 13. Agent Tools

| Tool                    | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `get_event`             | Retrieve one event                                 |
| `find_events`           | Search related events                              |
| `get_candidate_matches` | Retrieve possible relationships                    |
| `calculate_chain`       | Calculate financial chain using deterministic code |
| `validate_payout`       | Validate payout invariant                          |
| `get_policies`          | Retrieve approved policies                         |
| `propose_match`         | Submit recommended relationship                    |
| `request_human_review`  | Escalate uncertain case                            |

Agent output:

```ts
interface AgentRecommendation {
  recommendation: string;
  confidence: number;
  evidence: Evidence[];
  requiresHumanReview: boolean;
}
```

---

# 14. Exceptions

| Exception Type            | Meaning                                |
| ------------------------- | -------------------------------------- |
| `ambiguous_match`         | Multiple plausible matches             |
| `unbalanced_payout`       | Financial chain does not balance       |
| `missing_reference`       | Expected reference missing             |
| `cross_period_adjustment` | Related event occurs in another period |
| `unexpected_fx`           | FX relationship requires investigation |
| `possible_duplicate`      | Possible duplicate event               |
| `unmatched_bank_deposit`  | Deposit has no explained payout        |
| `unknown`                 | Uncategorized reconciliation issue     |

Each exception contains:

| Field          | Required |
| -------------- | -------- |
| Summary        | Yes      |
| Related events | Yes      |
| Recommendation | Yes      |
| Confidence     | Yes      |
| Evidence       | Yes      |
| Status         | Yes      |

Statuses:

* Open
* Approved
* Rejected
* Unresolved

---

# 15. Human Review

Each review displays:

| Information                 | Required |
| --------------------------- | -------- |
| Exception                   | Yes      |
| Transactions                | Yes      |
| Sources                     | Yes      |
| Amounts                     | Yes      |
| Currency                    | Yes      |
| Dates                       | Yes      |
| Candidate relationship      | Yes      |
| Agent explanation           | Yes      |
| Evidence                    | Yes      |
| Confidence                  | Yes      |
| Financial validation result | Yes      |

Actions:

| Action           | Result                                       |
| ---------------- | -------------------------------------------- |
| Approve          | Save relationship and create approved policy |
| Reject           | Mark relationship rejected                   |
| Leave Unresolved | Keep case unresolved                         |

---

# 16. Reconciliation Policies

Human-approved decisions produce constrained policies.

Example:

| Field        | Value                          |
| ------------ | ------------------------------ |
| Source       | Stripe                         |
| Event        | Refund                         |
| Condition    | Exact parent charge reference  |
| Condition    | Same currency                  |
| Cross-period | Allowed                        |
| Action       | Attach refund to original sale |

The agent does not generate executable TypeScript rules.

Policy execution order:

```text
Exact references
↓
Approved policies
↓
Structured matching
↓
Exception investigation
```

---

# 17. Dodo Payments Integration

| Requirement    | Behavior                                 |
| -------------- | ---------------------------------------- |
| Endpoint       | Dodo webhook endpoint                    |
| Validation     | Validate incoming payload                |
| Normalization  | Convert event to `LedgerEvent`           |
| Metadata       | Preserve raw source metadata             |
| Persistence    | Store normalized event                   |
| Reconciliation | Include event in reconciliation pipeline |

Dodo event types used:

* Sale
* Refund
* Dispute
* Payout

---

# 18. TensorMux

| Requirement                        | Behavior              |
| ---------------------------------- | --------------------- |
| Purpose                            | Recon Agent inference |
| Input                              | Structured JSON       |
| Output                             | Structured JSON       |
| Validation                         | Zod                   |
| Invalid model response             | Execution error       |
| Invalid response as reconciliation | Forbidden             |

---

# 19. Neatlogs

Neatlogs records:

| Trace                   |
| ----------------------- |
| Agent execution         |
| Model request           |
| Model response          |
| Tool call               |
| Tool result             |
| Validation error        |
| Agent error             |
| Recommendation          |
| Confidence              |
| Human-review escalation |

---

# 20. Application Screens

| Screen            | Contents                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| Overview          | Financial totals, reconciliation status, exceptions, Run Reconciliation |
| Transaction Graph | Sale-to-bank relationship graph                                         |
| Review Queue      | Agent recommendations and human decisions                               |
| Evaluation        | DriftRecon vs baseline metrics                                          |

---

# 21. Overview

Displays:

| Metric                             |
| ---------------------------------- |
| Total financial value              |
| Reconciled value                   |
| Unresolved value                   |
| Autonomous reconciliation coverage |
| Transaction count                  |
| Payout count                       |
| Bank deposit count                 |
| Exception count                    |
| Human-review count                 |

Main action:

**Run Reconciliation**

---

# 22. Transaction Graph

Graph structure:

```text
Sales
Fees
Refunds
Disputes
FX
   ↓
Payout
   ↓
Bank Deposit
```

Selecting a node displays:

| Detail                 |
| ---------------------- |
| Source                 |
| Type                   |
| Amount                 |
| Currency               |
| Date                   |
| External reference     |
| Parent reference       |
| Payout reference       |
| Connected transactions |
| Confidence             |
| Evidence               |
| Status                 |

---

# 23. Dataset

Synthetic company:

**Acme Creator Co.**

| Source                      | Included |
| --------------------------- | -------- |
| Stripe                      | Yes      |
| Gumroad                     | Yes      |
| Dodo                        | Yes      |
| Bank                        | Yes      |
| Multiple accounting periods | Yes      |
| Ground truth                | Yes      |

Required cases:

| Case                            | Required |
| ------------------------------- | -------- |
| Normal USD sale                 | Yes      |
| Multiple sales in one payout    | Yes      |
| Fee                             | Yes      |
| EUR sale                        | Yes      |
| EUR → USD conversion            | Yes      |
| Cross-period refund             | Yes      |
| Partial refund                  | Yes      |
| Dispute                         | Yes      |
| Chargeback                      | Yes      |
| Identical amounts               | Yes      |
| Missing reference               | Yes      |
| Duplicate                       | Yes      |
| Cross-period payout             | Yes      |
| Unmatched bank deposit          | Yes      |
| Repeated subscription amounts   | Yes      |
| Cross-period FX settlement      | Yes      |
| Refund in later payout          | Yes      |
| Payout with multiple deductions | Yes      |

---

# 24. Ground Truth

```ts
interface GroundTruthEdge {
  fromEventId: string;
  toEventId: string;
  relationship: Relationship;
}
```

| Rule                               | Requirement |
| ---------------------------------- | ----------- |
| Stored separately from predictions | Yes         |
| Available during matching          | No          |
| Available during evaluation        | Yes         |

---

# 25. Baseline

Baseline uses:

| Logic                        | Included |
| ---------------------------- | -------- |
| Same currency                | Yes      |
| Same/similar amount          | Yes      |
| Same accounting period       | Yes      |
| Basic date proximity         | Yes      |
| Cross-period graph reasoning | No       |
| Agent                        | No       |
| Policies                     | No       |

---

# 26. Evaluation

| Metric                             | Formula / Meaning                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| Precision                          | Correct predicted relationships ÷ all predicted relationships                    |
| Recall                             | Correct predicted relationships ÷ all true relationships                         |
| Payout Coverage                    | Correctly explained payouts ÷ total payouts                                      |
| Residual Amount                    | Sum of unexplained differences                                                   |
| False Auto-Match Count             | Incorrect automatic relationships                                                |
| False Auto-Match Rate              | Incorrect automatic relationships ÷ automatic relationships                      |
| Human Review Count                 | Cases sent to review                                                             |
| Autonomous Reconciliation Coverage | Correctly auto-reconciled financial value ÷ total value requiring reconciliation |

All metrics are calculated from actual runtime predictions.

Hard-coded benchmark values are forbidden.

---

# 27. Required Learning Scenario

| Stage     | Event                                      |
| --------- | ------------------------------------------ |
| June      | Stripe sale +$1,000                        |
| July      | Stripe refund -$200                        |
| First run | Exception created                          |
| Agent     | Finds original sale and presents evidence  |
| Human     | Approves                                   |
| System    | Creates cross-period refund policy         |
| Next run  | Policy resolves same pattern automatically |
| Evidence  | Applied policy ID is recorded              |

---

# 28. Required End-to-End Product Flow

| Step | User/System Action                             |
| ---: | ---------------------------------------------- |
|    1 | Load Acme Creator Co.                          |
|    2 | View imported transactions                     |
|    3 | Run reconciliation                             |
|    4 | View automatic matches                         |
|    5 | Open transaction graph                         |
|    6 | Trace bank deposit back to source transactions |
|    7 | Open cross-period refund exception             |
|    8 | View agent recommendation and evidence         |
|    9 | Approve                                        |
|   10 | View generated policy                          |
|   11 | Re-run reconciliation                          |
|   12 | See policy resolve known pattern               |
|   13 | Open Evaluation                                |
|   14 | Compare DriftRecon against baseline            |

---

# 29. Reliability Rules

| Rule                            | Required  |
| ------------------------------- | --------- |
| Silent data loss                | Forbidden |
| Fabricated transactions         | Forbidden |
| Amount mutation                 | Forbidden |
| LLM as financial calculator     | Forbidden |
| Auto-accept unbalanced payout   | Forbidden |
| Hide unresolved cases           | Forbidden |
| Fabricated evidence             | Forbidden |
| Fabricated metrics              | Forbidden |
| Persist human decisions         | Required  |
| Persist policy provenance       | Required  |
| Persist reconciliation evidence | Required  |
| Deterministic calculations      | Required  |

---

# 30. Tests

| Test Area                    | Required |
| ---------------------------- | -------- |
| CSV parsing                  | Yes      |
| Dodo normalization           | Yes      |
| Minor-unit money conversion  | Yes      |
| Exact reference matching     | Yes      |
| Parent reference matching    | Yes      |
| Payout reference matching    | Yes      |
| Structured scoring           | Yes      |
| Cross-period refunds         | Yes      |
| Partial refunds              | Yes      |
| Disputes                     | Yes      |
| FX                           | Yes      |
| Payout validation            | Yes      |
| Bank deposit matching        | Yes      |
| Duplicate detection          | Yes      |
| Confidence thresholds        | Yes      |
| Policy application           | Yes      |
| Approval                     | Yes      |
| Rejection                    | Yes      |
| Evaluation metrics           | Yes      |
| Ground-truth comparison      | Yes      |
| False auto-match calculation | Yes      |

---

# 31. Agent Orchestrator Development Structure

| AO Area               | Ownership                                          |
| --------------------- | -------------------------------------------------- |
| Reconciliation Engine | Matching, scoring, invariants, graph, FX           |
| Data + Evaluation     | Dataset, ground truth, baseline, metrics           |
| Agent + Policies      | TensorMux, agent tools, review, policies, Neatlogs |
| Product UI            | Overview, graph, review queue, evaluation          |
| Integration Review    | Full-system correctness and integration            |

AO is used to develop, review, debug, and integrate DriftRecon.

AO is not DriftRecon's runtime reconciliation framework.

---

# 32. Repository Structure

```text
driftrecon/
├── src/
│   ├── routes/
│   │   ├── +page.svelte
│   │   ├── dashboard/
│   │   ├── graph/
│   │   ├── review/
│   │   ├── evaluation/
│   │   └── api/
│   └── lib/components/
│       ├── ui/
│       └── ImportPanel.svelte
│
├── lib/
│   ├── ingestion/
│   ├── reconciliation/
│   ├── agent/
│   ├── policies/
│   ├── evaluation/
│   ├── integrations/
│   └── db/
│
├── data/
│   ├── stripe.csv
│   ├── gumroad.csv
│   ├── bank.csv
│   ├── dodo-events.json
│   └── ground-truth.json
│
├── tests/
└── README.md
```

---

# 33. Final Product Boundary

| DriftRecon Does                           | DriftRecon Does Not                  |
| ----------------------------------------- | ------------------------------------ |
| Reconcile payment events to bank deposits | Replace the general ledger           |
| Handle fees                               | Tax accounting                       |
| Handle refunds                            | Revenue recognition                  |
| Handle disputes                           | General bookkeeping                  |
| Handle FX                                 | Automatically post journal entries   |
| Handle cross-period relationships         | Become a generic AI CFO              |
| Investigate ambiguity                     | Let an LLM control financial truth   |
| Human review                              | Hide uncertainty                     |
| Learn approved reconciliation policies    | Execute arbitrary AI-generated rules |
| Measure reconciliation accuracy           | Fabricate results                    |

## Final Definition

**DriftRecon explains how supported financial events move from sale to bank, automatically resolves financially valid relationships, investigates ambiguity with an AI agent, routes uncertainty to human review, learns approved reconciliation policies, and measures its results against labeled ground truth.**
