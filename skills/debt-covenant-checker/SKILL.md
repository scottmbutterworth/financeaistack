---
name: debt-covenant-checker
description: Read a user-supplied facility agreement, map each covenant to ledger lines, and calculate leverage, interest cover, gearing, and the other ratios using the agreement's own definitions. Use when a CFO needs headroom now and on a forecast, a breach-risk flag, draft compliance-certificate workings, or a note on dividends and on-market buy-backs. It does not replace the lender's reading of the contract.
---

# Debt covenant checker

The agreement is the definition. If the clause and the model use different EBITDA, the clause wins, and the workings show both so the difference is obvious.

Licence: MIT. The licence file is `LICENCE.md` in this folder.

## When to use

- You have a facility agreement, a side letter, or a term sheet the user has uploaded, and you need the financial covenants extracted into a working paper.
- You have a trial balance or management accounts and, if you are testing a forecast, the forecast file.
- You are drafting the workings for a compliance certificate. A person still signs it.
- You want a short capital-management note on a dividend or an on-market buy-back next to the covenant test. The legal tests are separate from the facility test. Do both.

## What this skill will not do

- It will not assume a definition of EBITDA, net debt, interest, or gearing. Those words mean what the clause says.
- It will not say the group is in breach or in compliance. It will say "on these workings, the ratio is x against a limit of y" and list every input that is still open.
- It will not tell the board to pay a dividend or to buy back shares.

## Inputs you need

- The facility agreement and every amendment and waiver the user wants included. Note the document date and the clause numbers as printed.
- Which borrower and which guarantors are in the test, as the clause defines the group.
- The test date, and the statement the user wants tested (statutory, management, or forecast).
- A mapping from the user's trial balance to the lines the clause names. If the user has not mapped a line, leave it blank.
- The forecast, if headroom on the forecast is required, and who prepared it.
- For a dividend note: the proposed amount, whether it is franked, and a balance sheet the user identifies for the section 254T test. Do not invent the franking percentage.
- For a buy-back note: the proposed number of shares and the user's history of votes bought back in the last 12 months. Do not invent the share count.

## Workflow

1. Extract. For each financial covenant, fill one row in `covenant-extract-template.md`: clause number, the ratio in the words of the clause, the limit, the test dates, equity cure or waiver rights if the clause states them, and the page you read. Quote the definition. Do not paraphrase a definition that changes the maths. If a definition runs for a page, attach the quote and say "see extract".
2. Map. Each term in the definition (net debt, EBITDA, interest, total assets, total liabilities, or whatever the clause uses) gets a list of ledger lines and a sign. Adjustments the clause allows, such as specified EBITDA add-backs, are included only when the clause lists them and the user has an amount for that item. An adjustment the model "usually" makes is excluded and listed as excluded.
3. Calculate the current test. Show the formula in words, then the numbers, then the ratio, then headroom in the units the clause uses (turns of EBITDA, a percentage, a dollar surplus). Show the arithmetic. Label management accounts as management accounts.
4. Calculate the forecast test on the same definitions. If the forecast does not contain a line the definition needs, the forecast test is "not calculated" for that covenant.
5. Flag. Use only these labels:
   - "Headroom above the user's threshold." The user must name the threshold. If they do not, do not invent a 10 or 20 per cent cushion. Report the headroom and write "no internal threshold given".
   - "Headroom inside the user's threshold."
   - "On these workings the limit is not met."
   - "Not calculated. Missing input."
   A breach of a facility is a legal conclusion. The flag is arithmetic. Add the sentence: "Counsel or the lender's agent confirms whether this is a breach, a review event, or neither."
6. Draft the compliance-certificate workings in `compliance-certificate-workings.md`. Leave the signature block blank. Do not date it as signed.
7. If the user asks about a dividend or a buy-back, attach `capital-management-notes.md` and complete only the rows they can support with documents.
8. Reconcile the covenant EBITDA to statutory profit. The bridge is part of the workings. An adjustment with no clause reference comes off.

## Output templates

- `covenant-extract-template.md`
- `compliance-certificate-workings.md`
- `capital-management-notes.md`
- `example-calculations.md` is example data.

## Checks before you finish

- Every ratio cites a clause number from a document the user supplied.
- No EBITDA add-back lacks a clause reference and an amount from a file.
- The group (who is in, who is out) matches the clause, including any permitted acquisition or excluded subsidiary the clause names.
- Net debt includes or excludes cash only as the clause says. Locked cash is not treated as cash unless the clause says so.
- The forecast uses the same definitions as the current test.
- The compliance certificate is marked draft.
- Dividend and buy-back notes cite the Act sections below and do not invent a franking rate or a 10/12 balance.
- Open points are listed on the first page.

## Not advice

This is not accounting, tax, legal or financial advice. Check the workings with your auditor, your lawyers, and the facility agent before anyone sends a compliance certificate, declares a dividend, or announces a buy-back.
