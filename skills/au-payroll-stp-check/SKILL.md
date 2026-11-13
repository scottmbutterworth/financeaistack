---
name: au-payroll-stp-check
description: Reconcile Australian payroll to the general ledger and to Single Touch Payroll Phase 2. Use when a finance team has exports from Xero, MYOB, Employment Hero, KeyPay, or another payroll system and needs the payroll-to-ledger tie-out, the super guarantee check, the PAYG tie to the BAS, a year-end STP finalisation list, and an exceptions list. State payroll tax is a pointer only.
---

# Australian payroll and STP check

Tie the payroll register to the ledger and to what was reported. The exports are the source. If a column is missing, the check for that column is open.

Licence: MIT. The licence file is `LICENCE.md` in this folder.

## When to use

- You are reconciling a pay run, a month, a quarter, or a financial year.
- You have a payroll export, a general-ledger export, and, where the user has it, an STP report and a BAS working paper.
- You are preparing STP finalisation and want the exceptions listed before anyone lodges the finalisation declaration.

## What this skill will not do

- It will not lodge STP, a BAS, or a super payment.
- It will not decide that a worker is an employee or a contractor.
- It will not apply a state payroll-tax threshold from memory. It will point at the revenue office.

## Inputs you need

- Entity name, ABN if the user wants it on the paper, and the period.
- Payroll register for the period and the year-to-date totals. Note the system: Xero, MYOB, Employment Hero, KeyPay, or another named export. Do not assume column headers. Map them in the working paper.
- General-ledger detail for wages, PAYG withholding, superannuation expense, and the superannuation and PAYG payable accounts.
- STP Phase 2 year-to-date report, if the user has pulled one. If they have not, the STP section stays "not checked".
- The BAS working papers for W1 and W2, if the tie to the activity statement is in scope.
- Pay dates in the period, so the super due date can be tested against the rule that applies to that pay date.
- A note if any employees are on Norfolk Island, or if the employer has closely held payees. Both change the ATO timing. If the user does not know, ask. Do not guess.

## Rates and dates you may use

Re-open the ATO pages on the day you run this. The figures below were read on 13 November 2026. If the page disagrees, the page wins.

Super guarantee rate: https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee

- 1 July 2025 to 30 June 2026: 12 per cent.
- 1 July 2026 to 30 June 2027: 12 per cent.
- The same page has a different rate for Norfolk Island. If any worker is there, copy the rate from the page. Do not use 12 per cent for them without reading that row.
- The page also publishes a maximum contribution base. Copy the dollar cap for the year you are testing from the page. This skill does not hard-code it.

Due dates: https://www.ato.gov.au/businesses-and-organisations/super-for-employers/about-payday-super

That page was marked last updated 10 August 2026 when it was read.

- For pay dates before 1 July 2026, super was due quarterly. The ATO's quarterly due dates are 28 October, 28 January, 28 April, and 28 July, being 28 days after the end of the quarter.
- For pay dates on or after 1 July 2026, Payday Super applies. Contributions are paid each pay day and need to be received by the fund within 7 business days of pay day. The ATO page describes exceptions, including some new employees. Read the exception before you mark a new starter as late.
- From 1 July 2026 the ATO page says the base moves to qualifying earnings, and qualifying earnings and the super liability are reported through STP. Use the payroll system's qualifying-earnings field if the pay date is on or after that day. Do not keep testing ordinary time earnings for those pays unless the user is reconciling a period before the change.

STP finalisation: https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/single-touch-payroll/start-reporting/end-of-year-finalisation-through-stp

- Finalisation declaration is due by 14 July, so employees can use the information for their tax returns.
- Employers with 20 or more employees report closely held payees each pay day. Finalisation for closely held payees is 30 September.
- A small employer (19 or fewer employees) with only closely held payees finalises by the payee's tax return due date.
- An employer with both groups still finalises arm's-length employees by 14 July.
- Finalise the correct financial year. The ATO names this as a common error when the declaration is lodged after 30 June.
- Include employees paid during the year, including people who left and casuals who were paid.
- Payments not reported through STP still need a payment summary and a payment summary annual report.

BAS labels: tie gross wages and PAYG withheld to the labels on the current activity statement. This skill calls them W1 and W2 because that is how the activity statement is set out. Confirm the definitions on the current ATO activity statement instructions before you sign the reconciliation off. This skill does not link a paragraph that defines them.

Payroll tax: do not copy a threshold or a rate into the workings. Open the revenue office for each state or territory where taxable wages are paid (Revenue NSW, State Revenue Office Victoria, Queensland Revenue Office, RevenueWA, RevenueSA, State Revenue Office Tasmania, ACT Revenue Office, Territory Revenue Office NT) and record the threshold and rate from that page, with the date you read it.

## Workflow

1. Map the export. Write the column names you actually see for gross pay, PAYG, salary sacrifice, allowances, leave, super, and employee identifiers. Systems do not share headers. KeyPay and Employment Hero may be the same underlying product. Say which export you were given.
2. Complete `reconciliation-template.md`. Payroll register to the ledger, then payroll register to STP year-to-date, then PAYG to the BAS labels. Show the difference. Do not force a nil difference with a plug. A plug is an exception.
3. Test super employee by employee, or by pay run if the user only has pay-run totals. Say which. Apply the rate and the due rule for the pay date, not for today's date, when the period straddles 1 July 2026.
4. List exceptions in `exceptions-list.md`. Sort them: dollars that do not tie, people missing from STP, people in STP and not in the register, negative year-to-date amounts, duplicate employee identifiers, and super not received on the rule that applies.
5. For year-end, add the finalisation checks from the ATO page. Do not set the finalisation indicator. Tell the user it is ready for review, or list what is still open.
6. Stop. The user or their tax agent lodges.

## Output templates

- `reconciliation-template.md`
- `exceptions-list.md`
- `example-recon.md` is example data.

## Checks before you finish

- The period and the financial year are written on the first page.
- Super rate and due rule match the pay date, and the ATO URL is on the paper.
- Norfolk Island and closely held payees are either checked or marked "not asked".
- W1 and W2 are tied to the payroll totals the user named, or marked not in scope.
- No payroll-tax dollar threshold appears unless it is copied from a revenue-office page the user opened, with the URL and the date.
- STP finalisation is not described as lodged.
- Every difference has an owner or is marked unexplained.
- Example numbers from `example-recon.md` are not in the live workings.

## Not advice

This is not accounting, tax, legal or financial advice. Check the reconciliation with your tax agent and your auditor before you lodge STP, the BAS, or a super payment.
