# ShopLedger
## Stack
Node.js, Express 4 and body-parser serve a plain HTML/CSS/JS frontend.
The store persists records in data/db.json.
## Module map
- routes/products.js — Product search and available coupons
- routes/orders.js — Checkout, history and cancellation
- routes/customers.js — Khata accounts and settlements
- routes/reports.js — Dashboard, GST reconciliation, preview and export
- lib/inventory.js — Sellable stock, checks, reserve and release
- lib/coupons.js — Coupon eligibility and discount caps
- lib/pricing.js — Cart totals and proportional discounts
- lib/tax.js — HSN rates and CGST/SGST split
- lib/ledger.js — Khata charges, reversals and settlements
- lib/orders.js — Order creation, history and cancellation
- lib/dates.js — Display dates, comparison keys and fiscal year
- lib/store.js — Read/write JSON and append audit events
- lib/invoice.js — Invoice figures and printable HTML
- lib/reports.js — Dashboard and GST reconciliation
## Commands
- Start the app with `npm start`.
- Run the tests with `node --test`.
## Rules
1. Write characterization tests before changing behaviour.
2. Change only the modules named in the ticket.
3. Tests use in-memory fixtures and never read or write data/db.json.
4. Add no dependencies.
5. Make the smallest fix that works.
## Current ticket
Invoice & GST mismatch. Allowed production files: lib/invoice.js (lib/tax.js only if needed).
