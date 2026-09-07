# DriftRecon — Product Requirements Document

**Status:** Implementation baseline

**Product:** DriftRecon

**Platform:** Responsive SvelteKit web application
**Audience:** Finance operators, controllers, and founders closing multi-processor revenue

## Product promise

DriftRecon turns disconnected payment-processor and bank records into an explainable money trail. Every sale can be followed through fees, refunds, disputes, FX, payout, and final bank deposit. Deterministic code owns all arithmetic, the Recon Agent investigates exceptions, and a human owns uncertain decisions.

## Goals

1. Make close status understandable within five seconds of opening the workspace.
2. Show the complete economic chain without hiding source records or confidence.
3. Minimize human review while making every requested decision evidence-rich.
4. Preserve imported money values and maintain an audit-ready decision history.
5. Deliver the complete experience as an accessible, responsive SvelteKit/Svelte 5 application.

## Non-goals

- The agent does not post journal entries or mutate imported amounts.
- Ground truth never participates in matching.
- An LLM never performs authoritative financial arithmetic.
- Low-confidence or financially invalid relationships never auto-reconcile.

## Experience principles

- **Clarity before density:** each page has one primary question and a clear hierarchy.
- **Progressive disclosure:** summary first; references, reasons, and tools on selection.
- **Visible system status:** importing, running, stale data, review, approved, and error states are explicit.
- **Human control:** approve, reject, and defer are distinct; the audit impact is stated beside decisions.
- **Financial legibility:** tabular figures, semantic status colors, restrained decoration, and source colors support scanning.
- **Accessible by default:** semantic landmarks, keyboard-focus indicators, named icon controls, 44px primary targets, responsive layouts, and reduced-motion support.

## Information architecture

| Route | User question | Primary action |
| --- | --- | --- |
| `/` | What is DriftRecon and why should I trust it? | Explore workspace |
| `/dashboard` | What is imported, reconciled, and unresolved? | Import / run reconciliation |
| `/graph` | How did money travel from sale to bank? | Select and inspect an event |
| `/review` | What needs my judgment and why? | Approve, reject, or defer |
| `/evaluation` | How does the system perform against truth and baseline? | Inspect measured outcomes |

## Functional requirements

### Import and overview

- Accept multiple Stripe, Gumroad, bank CSV, Dodo JSON, and optional ground-truth JSON files.
- Provide a bundled Acme dataset for a no-account demonstration.
- Display import progress, success count, retryable error, per-source counts, ledger metrics, review count, and run history.
- Distinguish an imported-but-not-yet-reconciled ledger from a current or stale run.

### Money map

- Render events in semantic columns: sales, adjustments, FX, payouts, and bank.
- Draw only non-rejected relationships and visually distinguish review edges.
- Provide zoom/reset controls and selection-driven details for amount, references, status, confidence, and evidence.
- Remain horizontally inspectable on constrained screens.

### Human review

- List open and deferred cases with current selection.
- Present agent recommendation, confidence, related immutable records, deterministic evidence, and payout invariant state before controls.
- Support approve, reject, and defer without a full navigation.
- Immediately persist the verdict; approval creates a constrained policy when eligible.

### Evaluation

- Compare DriftRecon and same-period baseline using predicted count, human review count, residual amount, precision, recall, payout coverage, false auto-matches, and autonomous coverage.
- Explicitly communicate whether a run and ground truth are available.

## Technical requirements

- SvelteKit provides routing, server rendering, endpoint handlers, and Node deployment output.
- Svelte 5 provides reactive UI components; React, Next.js, and React Flow are not runtime dependencies.
- Existing framework-independent TypeScript modules remain the source of truth for ingestion, matching, validation, policies, evaluation, and agent tools.
- API compatibility is retained at `/api/health`, `/api/import`, `/api/sample`, `/api/reconcile`, `/api/review`, `/api/state`, and `/api/webhooks/dodo`.
- The production build uses `@sveltejs/adapter-node` and starts with `node build`.

## Success measures

- A new user can load sample data and run reconciliation without documentation.
- Every open case exposes a recommendation, confidence, related records, and action controls.
- No automatic match violates configured confidence gates or payout invariants.
- All routes pass `svelte-check`, unit tests, lint, and the production build.
- Layout remains usable at 320px width and with reduced motion enabled.

## Acceptance scenario

A June Stripe sale of +$1,000 receives a July partial refund of −$200. The first run keeps the records connected but escalates the cross-period case. Review presents both source records, evidence, confidence, and invariant context. A human approves it, creating a constrained policy. On the next run the policy attaches the same valid pattern automatically and its ID appears on the relationship.
