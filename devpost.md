## Inspiration

The Autonomous Office of the CFO still has a hole: a sale, a fee, a refund, an FX conversion, a payout, and a bank deposit do not arrive as one story. Platforms speak different event languages. Periods split related activity. We wanted opener tools to reconstruct that path without letting a model invent money. TensorMux for investigation. Neatlogs for the trace. Dodo Payments for live payment events. Agent Orchestrator to build and review the system. Not a starter template.

## What it does

DriftRecon reconciles Stripe, Gumroad, Dodo, and bank activity for Acme Creator Co.

Code calculates. The Recon Agent on TensorMux investigates exceptions with tools. Neatlogs records the agent run. A human approves, rejects, or leaves a case unresolved. An approved decision becomes a constrained policy. The next run can resolve the same pattern without asking again.

The product is Overview, Graph, Review, and Evaluation. Sale → fee / refund / dispute / FX → payout → bank deposit.

## How we built it

Agent Orchestrator owned the build: reconciliation engine, data and evaluation, agent and policies, product UI, integration review. AO is how DriftRecon was developed. AO is not the runtime matcher.

TensorMux runs the Recon Agent. Input and output are structured JSON. Zod validates both. An invalid model response is an execution error, never a reconciliation result.

Neatlogs traces agent execution, model request and response, tool calls, tool results, validation errors, recommendations, confidence, and human-review escalation.

Dodo Payments is a live source. The webhook validates the payload, normalizes it to `LedgerEvent`, keeps raw metadata, stores the event, and includes it in the next reconcile.

Deterministic TypeScript owns amounts, scores, payout invariants, and confidence thresholds. The agent can inspect, rank, explain, and request review. It cannot change amounts, invent evidence, or mark an unbalanced payout reconciled.

## Challenges we ran into

The opener tools are strong at investigation and weak at financial truth if you let them. TensorMux will write a confident sentence. That sentence is not a balance. Neatlogs will store a bad run if you treat a parse failure as a match. Dodo will send a refund in a later period than the sale. Agent Orchestrator will ship a slice that looks complete until evaluation hits ground truth.

The hard work was keeping each tool in its lane: Dodo supplies events, TensorMux investigates, Neatlogs traces, TypeScript calculates, the human decides.

## Accomplishments that we're proud of

Opener tools used as tools, not as a template. A Recon Agent that can only call `get_event`, `find_events`, `get_candidate_matches`, `calculate_chain`, `validate_payout`, `get_policies`, `propose_match`, and `request_human_review`. A Dodo webhook that becomes a ledger event without mutating amounts. Neatlogs on the agent path. A June sale and July refund that stay connected, go to review, become a policy, and resolve on the next run. Evaluation against labeled ground truth, not a hard-coded score.

## What we learned

Partner tools do not replace a ledger. TensorMux is for structured investigation. Neatlogs is for seeing what the agent actually did. Dodo is for real payment events. Agent Orchestrator is for building and reviewing the product. Arithmetic stays in code. Uncertainty stays visible.

## What's next for Driftrecon

More Dodo event coverage. Tighter Neatlogs on every tool call. More policy types learned from review, still not executable model-written code. Keep evaluation live against ground truth. Keep Agent Orchestrator on development, not in the money path.
