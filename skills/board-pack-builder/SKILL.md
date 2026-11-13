---
name: board-pack-builder
description: Assemble a monthly or quarterly board and audit-committee finance pack from ledger exports, an FP&A model, and KPI files. Use when a CFO needs a pack structure, variance commentary against budget and last year, cash and funding headroom, risks, decisions, a one-page summary, and a cross-cast of the numbers. Works from uploaded spreadsheets and CSVs. It does not log into the ledger.
---

# Board pack builder

Build the pack the board can read in one sitting. The numbers come from the files the user uploads. If a number is not in a file, it does not go in the pack.

Licence: MIT. The licence file is `LICENCE.md` in this folder.

## When to use

- You are preparing the monthly or quarterly finance section of a board pack, or the finance section of an audit-committee pack.
- You have exports, not a live login: a trial balance or management P&L, a budget, last year's actuals, a cash balance, a facility schedule, and a KPI extract.
- You want the commentary written in plain English, with the decision at the top.

## What this skill will not do

- It will not connect to Xero, NetSuite, or any other system.
- It will not round a number to make a variance look smaller.
- It will not invent a forecast, a covenant headroom, or a risk rating. If the file does not contain it, the line says "not in the upload".

## Inputs you need

- Entity name, period, and whether the pack is monthly or quarterly. Say if the figures are consolidated or standalone.
- Profit and loss for the period and year to date, with budget and prior year, and the file name of each column.
- Balance sheet, or at least cash, debt, working capital, and net assets.
- Cash flow for the period, or a cash bridge from opening cash to closing cash.
- Facility list: limit, drawn, undrawn, expiry, and any headroom the treasury file already calculates. Do not calculate a covenant here. Use the debt-covenant skill if the user supplies the agreement.
- KPI file, with the definition of each KPI written next to it.
- A list of decisions the CFO wants from the board, if any. If there are none, write "no decision requested".
- The audience: full board, audit committee, or both. The audit-committee pack keeps the control and judgement items and drops the operating colour.

## Workflow

1. Inventory the files. Write a source table: file name, what it is, period it covers, currency, and who exported it. If two files disagree, stop on that line and show both figures. See `consistency-checks.md`.
2. Draft the one-page summary in `one-page-summary.md`. Four blocks only: result, cash, what changed, what we need from the board. Use the entity's own words for the result (statutory profit, underlying profit, or both). If both are used, the statutory number is first and the other number carries its reconciliation.
3. Write the CFO report in the order in `cfo-report-template.md`. Same order every month, so a director who misses a meeting can still find the cash page.
4. Write variance commentary with `variance-commentary.md`. Every variance the CFO wants discussed has three lines: what moved, why it moved, whether it repeats. "Timing" is allowed only when the file shows the item reversing, or when the user has said it reverses. Otherwise write "cause not in the file".
5. Cash and funding. Opening cash, closing cash, the bridge, undrawn facilities from the treasury file, and the months of fixed cash costs only if the user has defined the denominator. Do not invent a runway multiple.
6. Risks and judgements. List accounting judgements the papers already identify (revenue cut-off, impairment indicators, provisions). Do not add a risk that is not in the upload or in the user's note. Rate nothing unless the user has given a scale.
7. Decisions. One row per decision: the question, the options that are in the paper, the number each option uses, and what happens if the board does not decide this meeting.
8. Audit-committee appendix, if asked. Judgements, any unadjusted differences the auditor has sent, related-party items in the file, and the status of the management representation letter. Do not draft the representation letter as if it were signed.
9. Run the consistency checks. Then stop.

## Output templates

- `one-page-summary.md`
- `cfo-report-template.md`
- `variance-commentary.md`
- `consistency-checks.md`
- `example-pack-outline.md` is example data. Do not reuse the figures.

## Checks before you finish

- Every reported number cites a file name and a cell, column, or row label.
- The one-page summary uses no number that is absent from the body of the pack.
- Budget variances and prior-year variances are labelled as such and are not mixed in one column.
- Favourable and unfavourable are defined once (for example, a revenue increase is favourable, a cost increase is unfavourable) and then used the same way.
- Cash on the summary equals cash on the balance sheet page.
- Debt on the summary equals the facility schedule.
- Percentages show the base. A variance on a small base is shown in dollars as well.
- Open items are labelled open. Missing uploads are listed at the top, not buried.
- The pack says whether the figures are management accounts or reviewed or audited accounts, and it says that only if the user said so.

## Not advice

This is not accounting, tax, legal or financial advice. Check the pack with your auditor and your other advisers before the board relies on it.
