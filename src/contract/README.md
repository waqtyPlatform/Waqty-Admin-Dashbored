# Canonical contract (vendored mirror)

`waqty_contract.ts` and `platform_finance.ts` in this folder are a **verbatim
mirror** of the canonical ecosystem contract that lives at the repo root:

```
<workspace>/contract/waqty_contract.ts
<workspace>/contract/platform_finance.ts
```

That root file is the single source of truth shared by all four Waqty apps
(SuperAdmin, Provider dashboard, and the two Flutter apps, which mirror it in
`waqty_contract.dart`). The two web dashboards consume these TypeScript types
directly.

## Rules

1. **Do not hand-edit these files.** Any change to the contract starts in the
   root `contract/waqty_contract.ts`, then is copied back into this folder
   (and into the Flutter mirrors) together.
2. These copies are kept **byte-identical** to the root source so the mirror is
   trivially verifiable (`diff`).
3. App-specific types (display-only fields, API DTOs, mock-store shapes) live in
   `src/types/*` and `src/lib/api.ts`. Those are free to extend the canonical
   entities, but must not redefine or diverge from the shared shapes — re-export
   the canonical type instead.

## Why vendored instead of a path alias

The canonical file sits outside this Next.js project root. Vendoring keeps the
build self-contained and avoids cross-root module-resolution issues, while the
byte-identical copy preserves the "one source" intent. The end-state (per the
contract docs) is a shared package both dashboards depend on; until that exists,
this mirror + `diff` check is the bridge.
