# Example matrix

EXAMPLE DATA. Example Holdings Limited is not a real entity. The login names are invented.

| ID | Risk | Control | Test in this example | Result |
| --- | --- | --- | --- | --- |
| F-1 | A manual journal is posted after the close and changes the result with no review | Journals after the close date need a second login | Extract example-journals.csv, close date 5 April 2026. One journal, JNL-100, posted 6 April 2026 by A. Example, amount 10,000, no second login on the row. | Exception. The example does not say the journal is wrong. It says it met the filter. |
| F-2 | The same login changes a supplier and releases a payment | Those two roles are held by different people | example-users.csv shows B holds both roles | Exception on the starter segregation list. Not a conclusion that a payment was diverted. |

Do not copy JNL-100 or the amount into a live report.
