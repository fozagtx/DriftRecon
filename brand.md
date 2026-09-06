# Brand — DriftRecon

_Status: applied_

CFO workstation for payment-to-bank reconciliation. Dark-native, dense, warm ink on charcoal paper. One accent for reconciled money; amber for review.

## Direction

| Item     | Choice                                                                 |
| -------- | ---------------------------------------------------------------------- |
| Product  | DriftRecon — reconcile payment events to bank deposits                 |
| Category | infra/data · tooling/finance                                           |
| Mood     | technical · serious                                                    |
| Style    | Workstation Dense + warm monochrome                                    |
| Density  | Compact                                                                |
| Surface  | Flat panels, hairline rules, no stacked card chrome                    |
| Type     | Tight, technical, mono-heavy numbers                                   |
| Motion   | Crisp, under 200ms, no bounce                                          |

## Palette (dark-native)

| Token                 | Hex       | Use                         |
| --------------------- | --------- | --------------------------- |
| `--background`        | `#161310` | Page                        |
| `--foreground`        | `#EDE6D9` | Body text                   |
| `--card`              | `#1C1915` | Panels                      |
| `--primary`           | `#3F7A5A` | Reconciled / primary action |
| `--accent`            | `#C4A46A` | Review / attention          |
| `--destructive`       | `#B85C4A` | Unresolved / reject         |
| `--muted-foreground`  | `#9A9184` | Meta                        |
| `--border`            | `#2A261F` | Hairline                    |

Light mode exists for completeness. Product is dark-first.

## Typography

| Role    | Face            | Use                              |
| ------- | --------------- | -------------------------------- |
| Sans    | IBM Plex Sans   | UI, labels, explanations         |
| Mono    | IBM Plex Mono   | Amounts, refs, IDs, confidence   |
| Display | Newsreader      | Page titles only                 |

## Voice

Short. Specific. Accounting-plain. Never "AI-powered." Say what the number is and why it is or is not reconciled.

## Do / Don't

**Do:** tabular numbers, exception-first overview, evidence lists, policy IDs on auto-matches.

**Don't:** purple gradients, Inter, generic KPI icon cards, invented metrics, hiding unresolved cases.
