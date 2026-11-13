---
name: finance-risk-and-controls
description: Build and test a finance risk register and key controls matrix from the entity's own process notes and system exports. Use when a CFO is preparing a risk-control matrix, a segregation-of-duties review, journal-entry testing, an access review, a control self-assessment, or the finance section of an audit-committee pack. References ASX Corporate Governance Principles Recommendation 7 and Corporations Act section 295A.
---

# Finance risk and controls

Write down the risks the finance team actually runs, the control that sits on each one, and the test you performed. A control you did not test is "not tested", not "effective".

Licence: MIT. The licence file is `LICENCE.md` in this folder.

## When to use

- You are building or refreshing the finance risk register and the key controls matrix.
- You have a user listing, a role listing, or a journal extract, and you want a segregation-of-duties review or a journal test.
- You are drafting the finance paper for the audit committee, including the annual risk-framework review the board has to speak to under the ASX Principles.

## What this skill will not do

- It will not rate a control as effective because a policy exists.
- It will not call a journal fraudulent. It will call it an item for review.
- It will not sign the section 295A declaration. It will list the support the CFO may want under it.

## Inputs you need

- Entity name, whether it is listed on ASX, and the period the register covers.
- The current risk register, if there is one, and the board's risk appetite in the user's words. If there is no appetite statement, do not invent one.
- Process notes or a walkthrough for each cycle the user wants in the matrix (close, revenue, payroll, treasury, tax, reporting). If there is no note, the control is "described by the user on [date]" or "not documented".
- For segregation of duties: a user export and a role or permission export. The system name and the date of the export.
- For journals: a journal listing with date, user, source (manual or system), amount, and account. Say if the file is complete.
- For access: the same user list, leavers in the period, and who approved access.
- The section 295A declaration is only relevant for a listed company, disclosing entity, or registered scheme, and only for the annual financial report. See the note below.

## Sources

- ASX Corporate Governance Principles and Recommendations, 4th edition, February 2019: https://www.asx.com.au/content/dam/asx/about/corporate-governance-council/cgc-principles-and-recommendations-fourth-edn.pdf
- The Council's page, which says the Principles are applied on an "if not, why not" basis and that the 4th edition was released on 27 February 2019: https://www.asx.com.au/about/regulation/corporate-governance-principles-and-recommendations
- Corporations Act section 295A, compilation of 19 September 2026: https://www.legislation.gov.au/C2004A00818/2026-09-19 and the current compilation at https://www.legislation.gov.au/C2004A00818/latest

Recommendation 7, as read in that 4th edition PDF:

- Principle 7: a listed entity should establish a sound risk management framework and periodically review the effectiveness of that framework.
- Recommendation 7.1: a risk committee of at least three members, a majority of them independent, chaired by an independent director, with the charter, the members, and the meeting attendance disclosed. If the board does not have a committee that meets that test, disclose that fact and the process it uses instead. The commentary says the committee may be a stand-alone risk committee, a combined audit and risk committee, or more than one committee.
- Recommendation 7.2: the board or a committee reviews the risk management framework at least annually, including whether the entity is operating with due regard to the risk appetite the board set, and discloses whether that review happened.
- Recommendation 7.3: disclose the internal audit function, or disclose that there is not one and what is done instead.
- Recommendation 7.4: disclose any material exposure to environmental or social risks and how the entity manages them.

The Principles are not a listing rule by themselves. The annual report still has to deal with Listing Rule 4.10.3. This skill does not draft the corporate governance statement. It drafts the finance evidence the committee may use.

Section 295A, for a listed entity's annual directors' declaration: the people who perform the chief executive function and the chief financial officer function give a written, dated, signed declaration, stating the capacity in which they sign, on the section 286 records, compliance with accounting standards, the true and fair view, the consolidated entity disclosure statement in subsection 295(3A), and any prescribed matters. The directors' declaration under subsection 295(4) comes after that, and says the declarations were given. Subsection 295A(8) says this does not reduce a director's responsibility.

## Workflow

1. Build the register on `risk-control-matrix.md`. One risk per row. The risk is a finance risk (misstatement, loss, late lodgement, unauthorised payment), not a strategy essay. The cause and the control are specific enough that a new accountant could test them.
2. Mark the control owner as a role, not a hope. If the owner is the same person who performs the process, say so. That is not automatically a failure. It is a fact for the committee.
3. Run `sod-review.md` from the user and role exports. Test the conflicts the user lists. If they do not list any, use the starter pairs in that file and say you used the starter list.
4. Run `journal-testing.md` on the extract. The tests are filters, not accusations: manual journals, journals on a weekend, round-sum journals, journals after the close date the user names, and journals by users the user marks as unusual. A hit goes to review. It is not a finding until a person looks at it.
5. Access review. Join users to current employees if the user supplied a staff list. Leavers with a live login are an exception. Privileged finance roles (posting, payment release, master-data changes) are listed with the approver, or "approver not in the file".
6. Control self-assessment. For each key control the user marks as key, the operator answers three questions: did it operate, what is the evidence, what failed. The CFO does not answer for them. If the operator has not answered, the row says "no self-assessment returned".
7. Draft `audit-committee-report.md`. Lead with what was tested, what was not, and what needs a decision. Map the annual review to Recommendation 7.2 only if the user is preparing that disclosure. Do not write "the framework is sound". Write what was reviewed.
8. If it is year end for a listed entity, add a section 295A support list: the reconciliations, the exception logs, and the open items the CFO would want to see before signing. Do not draft the declaration as a signed document.

## Output templates

- `risk-control-matrix.md`
- `sod-review.md`
- `journal-testing.md`
- `audit-committee-report.md`
- `example-matrix.md` is example data.

## Checks before you finish

- Every risk has a source: the old register, a process note, or "user added on [date]".
- No control is marked effective without a test and a result.
- Segregation and access comments cite the export file name and the extract date.
- Journal hits quote the journal number from the file. No hit is described as fraud.
- Recommendation 7 is cited at the 7.1 to 7.4 level only, from the 4th edition, and the "if not, why not" point is kept.
- Section 295A is used for the annual listed-entity declaration, not for a monthly pack.
- Open tests are listed on the first page of the committee paper.

## Not advice

This is not accounting, tax, legal or financial advice. Check the register and the tests with your auditor and your other advisers before the board relies on them or before anyone signs a section 295A declaration.
