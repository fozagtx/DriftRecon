## Inspiration

CFO teams have to explain how a Stripe or Dodo sale became a bank deposit after fees, refunds, disputes, FX, and payouts. Those events often land in different months and different files. We built DriftRecon so opener tools could investigate the messy cases while TypeScript did the arithmetic.

## What it does

DriftRecon loads Acme Creator Co. from Stripe, Gumroad, Dodo Payments, and a bank CSV. Every row becomes a `LedgerEvent`. Exact references, approved policies, and a structured score propose relationships. Payout math runs in TypeScript. Matches at 0.95 and above auto-resolve only if the payout balances. Everything else goes to the review queue.

TensorMux runs the Recon Agent on those exceptions. Neatlogs stores the agent trace. A reviewer can approve, reject, or leave the case unresolved. An approval writes a constrained policy that the next run can apply.

Screens: Overview, Graph, Review, Evaluation.

## How we built it

Agent Orchestrator split the work into reconciliation engine, data and evaluation, agent and policies, product UI, and integration review. AO stayed on development.

TensorMux serves the Recon Agent. Requests and replies are JSON. Zod validates them. A bad reply stops the agent call.

Neatlogs records agent execution, model I/O, tool calls, tool results, validation errors, recommendations, confidence, and review escalations.

The Dodo Payments webhook accepts sale, refund, dispute, and payout events, validates them, writes `LedgerEvent` rows, and includes them in reconcile.

Agent tools: `get_event`, `find_events`, `get_candidate_matches`, `calculate_chain`, `validate_payout`, `get_policies`, `propose_match`, `request_human_review`. Amounts and thresholds stay in TypeScript.

## Challenges we ran into

Cross-period refunds fail simple same-month matching. Two $29 subscriptions look like duplicates. An unbalanced payout can still have perfect references. TensorMux can return JSON that fails Zod. Dodo can send a refund after the original payout already settled.

## Accomplishments that we're proud of

The June $1,000 Stripe sale and the July $200 refund stay linked, open a review case, produce a policy on approval, and resolve on the next run. Dodo events enter through the webhook. Neatlogs has the agent path. Evaluation precision, recall, payout coverage, residual, and false auto-match rate come from this run against labeled ground truth.

## What we learned

Put TensorMux on investigation, Neatlogs on traces, Dodo on payment events, and Agent Orchestrator on the build. Leave addition and subtraction in code. Send uncertain matches to a person.

## What's next for Driftrecon

Cover more Dodo event types. Log every tool call in Neatlogs. Add policy kinds from review. Keep evaluation on live predictions.
