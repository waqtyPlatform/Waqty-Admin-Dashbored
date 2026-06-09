# Domain model (app-owned)

`waqty_contract.ts` and `platform_finance.ts` in this folder are **owned by this
app**. They were originally a vendored mirror of a shared ecosystem contract,
which was retired on 2026-06-10 — there is no sync, lock file, or drift check
anymore. Edit these files freely; the real backend API is the future source of
truth.

App-specific types (display-only fields, API DTOs, mock-store shapes) still live
in `src/types/*` and `src/lib/api.ts` and may extend the types defined here.
