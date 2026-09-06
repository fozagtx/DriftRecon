# DriftRecon

### Payment events to bank deposits, with the human still in charge of uncertainty.

DriftRecon reconciles Stripe, Gumroad, Dodo, and bank activity for **Acme Creator Co.** Code calculates. The Recon Agent investigates exceptions. A human decides anything uncertain. Approved decisions become constrained policies, then the next run can resolve the same pattern automatically.

Built for the **Autonomous Office of the CFO** track.

## How it works

1. **Import** Stripe / Gumroad / bank CSVs and Dodo webhooks into one `LedgerEvent` model. Invalid rows are kept.
2. **Reconcile** with exact references, approved policies, structured scores, then payout invariants. Money is integer minor units.
3. **Review** agent evidence. Approve, reject, or leave unresolved. Re-run. Open Evaluation to compare DriftRecon against a same-period baseline.

```text
Sale → Fee / Refund / Dispute / FX → Payout → Bank Deposit
```

## Run locally

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Run Reconciliation**, then walk Overview → Graph → Review → Evaluation.

Persistence is **Neon** (Lakebase Postgres). Set `DATABASE_URL` in `.env.local` to the pooled connection string.

Optional inference / tracing:

```bash
TENSORMUX_BASE_URL=
TENSORMUX_API_KEY=
TENSORMUX_MODEL=
NEATLOGS_API_KEY=
```

Without those keys the Recon Agent still investigates with deterministic tools. Invalid TensorMux JSON is an execution error, never a reconciliation result.

## Demo path

| Step | Action |
| ---: | ------ |
| 1 | Load Acme Creator Co. via Run Reconciliation |
| 2 | Inspect imported transactions |
| 3 | Open the June sale → July refund exception |
| 4 | Approve the agent recommendation |
| 5 | Re-run and see the policy ID on the match |
| 6 | Compare DriftRecon vs baseline on Evaluation |

## Boundary

DriftRecon explains how supported financial events move from sale to bank. It does not replace the general ledger, invent amounts, or let an LLM decide financial truth.

See [REQUIREMENTS.md](./REQUIREMENTS.md).
