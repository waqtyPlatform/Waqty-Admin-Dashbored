# Waqty Admin Dashboard

> Super-admin platform for managing the entire **Waqty / Hagzy** beauty & wellness booking ecosystem — service providers, end-users, subscriptions, marketing, finance, and system operations.

---

## Table of Contents

- [Product Overview](#product-overview)
- [System Architecture](#system-architecture)
- [Who Uses This Dashboard](#who-uses-this-dashboard)
- [Feature Modules](#feature-modules)
- [Key User Flows](#key-user-flows)
- [Role-Based Access Control](#role-based-access-control)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Mock Mode (Current State)](#mock-mode-current-state)
- [Deployment](#deployment)
- [Branch Strategy](#branch-strategy)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Product Overview

The **Waqty Admin Dashboard** is the operational control center for the Waqty platform. It gives platform operators (the Waqty team) everything they need to run, monitor, and grow a multi-sided marketplace connecting beauty service providers (salons, barbers, clinics, spas, nail studios) with end customers.

**What it does:**

- **Onboards** new service providers (approve registrations, collect documents)
- **Manages** every business on the platform (branches, employees, services, bookings)
- **Runs** the subscription & billing engine (plans, invoices, renewals, refunds, commissions)
- **Moderates** user-generated content (reviews, complaints, spam)
- **Handles** platform operations (support tickets, announcements, app versions)
- **Measures** platform health (revenue trends, booking volumes, user growth, geographic coverage)
- **Markets** the platform to users (ads, promo codes, push notifications, featured providers)

---

## System Architecture

The Waqty ecosystem consists of **four apps**, each serving a distinct audience:

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   User App (Mobile)       │         │   Employee App (Mobile)   │
│   Customers book & pay    │         │   Staff work shifts,      │
│   for services            │         │   track earnings          │
└────────────┬─────────────┘         └────────────┬─────────────┘
             │                                     │
             └─────────────────┬───────────────────┘
                               │
                  ┌────────────▼────────────┐
                  │   Provider Dashboard     │
                  │   (Web)                  │
                  │   Business owners manage │
                  │   their places           │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │   THIS REPO               │
                  │   Admin Dashboard         │
                  │   Platform operators      │
                  │   manage EVERYTHING       │
                  └───────────────────────────┘
```

**This repo** is the top-level control plane. It has visibility into and authority over all other apps in the ecosystem.

---

## Who Uses This Dashboard

| Persona | Responsibilities | Role |
|---------|------------------|------|
| **Platform CEO / CTO** | Strategic oversight, revenue, growth metrics | `super_admin` |
| **Operations Manager** | Day-to-day platform management, provider onboarding | `admin` |
| **Content Moderator** | Review moderation, content approvals, community | `moderator` |
| **Support Agent** | Respond to tickets, help providers/users | `support` |
| **Finance Manager** | Subscriptions, invoices, payouts, tax reports | `finance` |
| **Analyst / Investor** | Read-only access to reports and dashboards | `viewer` |

---

## Feature Modules

All 15 modules are accessible via the sidebar (permissions permitting).

### 1. Dashboard

The home page: a real-time snapshot of platform health.

- **8 KPI cards**: Total Providers, Users, Bookings, Revenue, Active Subscriptions, Pending Registrations, Open Tickets, Monthly Revenue
- **Revenue chart** — stacked area (subscriptions + commissions) over 10 months
- **Provider categories** — donut chart (Salon/Barber/Clinic/Spa/Nails)
- **Top 5 providers** — ranked by bookings + revenue with star ratings
- **Recent activity** — registrations, upgrades, flagged reviews, tickets, payouts

### 2. Service Providers

Manage every business on the platform.

**List view** (`/providers`)
- All 1,247+ providers with search, status filter, category filter
- Action menu per provider: **Block**, **Unblock**, **Suspend**, **Activate**, **Soft Delete**, **Restore**, **Impersonate**, **Change Plan**, **Adjust Commission**
- CSV export

**Detail view** (`/providers/[id]`)
- 6 tabs: **Overview**, **Branches**, **Employees**, **Services**, **Bookings**, **Subscription**
- Header actions: Suspend, Block, Login-as-Provider, Delete
- Status timeline, commission rate, registered date, last-active date

**Registrations** (`/providers/registrations`)
- Approval queue for new provider sign-ups
- Document verification (CR, Tax Card, License)
- One-click approve / reject with reason

### 3. Users (Customers)

Manage end-users of the booking apps.

**List view** (`/users`)
- All platform users with activity stats (bookings, spend, wallet balance)
- Status filter (active/blocked/suspended/deleted)
- Actions: Block, Suspend, Soft Delete, Restore, Manage Wallet, Send Notification

**Detail view** (`/users/[id]`)
- 4 tabs: **Overview**, **Bookings**, **Reviews**, **Wallet**
- Personal info, activity history, booking count, total spent, wallet balance

**Wallets hub** (`/users/wallets`)
- All user wallets overview
- Add funds, deduct funds, freeze/unfreeze
- Transaction history per wallet

### 4. Subscriptions

Run the recurring-revenue engine.

**Overview** (`/subscriptions`)
- Summary stats: Active / Trial / Past Due / Cancelled / MRR
- Per-subscription actions: **Renew**, **Upgrade**, **Cancel**, **Apply Discount**, **Extend Trial**, **Generate Invoice**, **Refund**

**Plans** (`/subscriptions/plans`)
- 3 tiers: Basic (EGP 299/mo), Pro (EGP 599/mo), Enterprise (EGP 1,299/mo)
- Feature matrix, limits (branches, employees, bookings/mo), trial length
- Create / edit plans

**Invoices** (`/subscriptions/invoices`)
- All issued invoices with status tracking (paid/pending/overdue/refunded)
- Download PDF, export all CSV

### 5. Reviews

Moderate user-generated reviews.

**Moderation** (`/reviews`)
- Summary stats, rating distribution, flagged count
- Per-review actions: **Publish**, **Flag**, **Hide**, **Respond** (platform response)
- Report counts, flag reasons displayed

**Analytics** (`/reviews/analytics`)
- Rating distribution chart
- Status breakdown pie chart
- Reviews-by-provider table

### 6. Reports

Six report categories for platform insights.

- **Revenue** — monthly breakdown, growth rate, average MRR
- **Bookings** — volume, completion rate, cancellations, no-shows
- **Users** — growth trends, active users, churn
- **Providers** — new vs churned, average rating, suspended count
- **Geographic** — distribution by city (Cairo, Alexandria, Giza, etc.)

### 7. Finance

The money command center.

- **Overview** (`/finance`) — total revenue, commissions earned, pending payouts
- **Commissions** — per-booking commission tracking (rate, amount, status)
- **Payouts** — provider payouts with status (pending/processing/completed)
- **Invoices** — all platform invoices
- **Tax Reports** — VAT calculations (14%), net revenue, CSV export

### 8. Marketing

Drive user acquisition and engagement.

- **Ads** — create/schedule/target ads for User App home banner, category pages, search results. Full analytics (impressions, clicks, CTR)
- **Push Notifications** — send to user/employee/all apps, target segments (active/inactive/new)
- **Promo Codes** — percentage or fixed discount codes with usage limits and validity windows
- **Campaigns** — email/push/featured-listing campaigns with budget tracking
- **Featured Providers** — ranked promotional spots with drag-to-reorder
- **Banners** — image banners for different placements

### 9. Support

Handle user and provider tickets.

- **Tickets list** (`/support`) — filtered by status, priority, category
- **Ticket detail** (`/support/[id]`) — full conversation thread with customer/admin/system messages, SLA tracking, attachments, resolve/close/reassign actions

### 10. Content

Manage user-facing content.

- **Pages** — Terms of Service, Privacy Policy, About, FAQ (bilingual editor)
- **Templates** — Email & SMS templates with variable substitution (`{{name}}`, `{{provider}}`)
- **Announcements** — Platform-wide notices with priority (low/normal/high) and target (all/users/providers/employees)
- **Categories** — Service categories (Hair, Beard, Nails, etc.) with icon + subcategories

### 11. Settings

Platform configuration.

- **Platform** — Name, default commission %, trial days, currency, booking limits
- **Countries** — Supported countries/cities
- **Payments** — Enable/disable gateways (Stripe, PayPal, Apple Pay, Fawry, Vodafone Cash)
- **Roles** — Define permissions per role
- **Admins** — Manage admin users (who has access to this dashboard)
- **Appearance** — Theme (light/dark/system), brand color
- **Localization** — Supported languages, currencies, timezone, date format
- **Security** — MFA, password policy, session timeout, IP allowlist

### 12. App Versions

Control mobile app releases.

- Track published versions for User (iOS/Android) and Employee (iOS/Android) apps
- Force update flag for critical patches
- Bilingual release notes

### 13. System Health

Real-time infrastructure monitoring.

- 8 service health cards: API Server, Database, CDN, Push, Payment Gateway, SMS, User Apps
- Uptime %, avg latency, error rate per service
- Overall platform status badge

### 14. Audit Logs

Tamper-evident record of every admin action.

- Who did what, when, from which IP
- Searchable by admin, action type, entity, date range
- Detailed payload of changes (e.g. "commission rate: 12% -> 10%")

### 15. Localization

Translation management for all three apps.

- Translation key editor (EN + AR for every key)
- Module filter (common, auth, booking, review, payment, etc.)
- Add / edit / search keys

---

## Key User Flows

### Flow 1 — Onboard a New Service Provider

```
Provider submits registration via Provider Dashboard
   v
Appears in Admin Dashboard -> Providers -> Registrations
   v
Admin reviews documents (CR, Tax Card, License)
   v
Admin clicks "Approve" -> Provider account activated
   v
Provider receives welcome email + 14-day free trial
   v
After trial, admin can assign plan or auto-convert to Basic
```

### Flow 2 — Handle Subscription Past-Due

```
Provider's payment fails -> status goes to "past_due"
   v
Admin sees orange indicator on /subscriptions
   v
Admin opens subscription -> clicks "Renew"
   v
Modal confirms renewal -> updates status to active + extends period
   v
OR admin can "Apply Discount" to incentivize payment
   v
OR admin "Cancels" if provider unresponsive (soft, end-of-period)
```

### Flow 3 — Moderate a Flagged Review

```
Multiple users report a review -> it shows in Reviews -> Moderation as "flagged"
   v
Admin reviews the comment
   v
Option A: Click "Publish" -> mark as OK, unflagged
Option B: Click "Hide" -> review hidden from User App
Option C: Click "Respond" -> post official platform response
   v
All actions logged to Audit Logs
```

### Flow 4 — Investigate Provider Issue (Impersonation)

```
Provider reports bug in their dashboard
   v
Admin opens Providers -> [Provider] -> clicks "Login as Provider"
   v
Impersonation banner appears at top: "Impersonating Glamour Studio"
   v
Admin navigates the Provider Dashboard exactly as the provider sees it
   v
Admin clicks "Exit impersonation" in banner
   v
Returns to admin dashboard; session logged in Audit Logs
```

### Flow 5 — Launch a Promotional Ad

```
Marketing team creates ad in Marketing -> Ads
   v
Uploads image, sets target URL
   v
Configures placement: "Home Banner" + dimensions 1200x400
   v
Sets schedule: 2026-04-15 -> 2026-04-30
   v
Sets targeting: Cities [Cairo, Alexandria], Categories [Salon]
   v
Saves as draft -> reviews -> clicks "Publish"
   v
Ad appears in User App within 5 minutes (after next poll)
   v
Marketing monitors impressions/clicks/CTR in admin dashboard
```

### Flow 6 — Resolve a Support Ticket

```
User submits ticket "Payment declined" -> ticket enters Support -> Open
   v
Support agent opens ticket -> reads description
   v
Replies with diagnostic questions -> conversation thread grows
   v
User attaches error screenshot -> agent identifies root cause
   v
Agent resets payment retry -> asks user to try again
   v
User confirms fix -> agent clicks "Resolve"
   v
SLA timer stopped; ticket moves to closed state
```

---

## Role-Based Access Control

Every page and action is gated by the `PermissionGate` component based on the logged-in admin's role.

| Module | super_admin | admin | moderator | support | finance | viewer |
|--------|:-:|:-:|:-:|:-:|:-:|:-:|
| Dashboard | Full | Full | View | View | View | View |
| Providers | Full | Full | View | View | View | View |
| Users | Full | Full | View | View | - | View |
| Subscriptions | Full | Full | - | - | Full | View |
| Reviews | Full | Full | Full | View | - | View |
| Reports | Full | Full | - | - | Full | View |
| Finance | Full | Full | - | - | Full | View |
| Marketing | Full | Full | Full | - | - | View |
| Support | Full | Full | Full | Full | - | View |
| Content | Full | Full | Full | - | - | View |
| Settings | Full | Full | - | - | - | View |
| Wallets | Full | Full | - | View | Full | View |
| Ads | Full | Full | Full | - | - | View |
| App Versions | Full | Full | - | - | - | View |
| Audit Logs | Full | Full | - | - | - | View |

**Impersonate** is exclusive to `super_admin`.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 16.2.3 (App Router, Turbopack) |
| **Language** | TypeScript (strict mode) |
| **UI** | React 19 + CSS Modules (no Tailwind) |
| **Styling tokens** | Hagzy design system (spacing, typography, color scales, dark mode) |
| **Charts** | Recharts 3 |
| **Forms** | React Hook Form + Zod (planned migration in progress) |
| **Icons** | Lucide React |
| **Notifications** | Sonner toasts |
| **Command palette** | cmdk |
| **Animation** | Framer Motion |
| **Dates** | date-fns |
| **Auth (mock)** | Custom AuthContext + localStorage (demo mode) |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+ (24 LTS recommended)
- npm 10+

### Install & Run

```bash
git clone https://github.com/waqtyPlatform/Waqty-Admin-Dashbored.git
cd Waqty-Admin-Dashbored
npm install
npm run dev
```

Open <http://localhost:3001> in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start dev server on port 3001 with Turbopack |
| `npm run build` | Type-check + optimize production bundle |
| `npm start` | Run production server |

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# API base URL (backend when ready; ignored in mock mode)
NEXT_PUBLIC_API_BASE_URL=https://waqty.alemtayaz.shop/public

# Mock mode — uses local mock data instead of live API
NEXT_PUBLIC_USE_MOCKS=true
```

For Vercel deployment, set these via the Vercel dashboard under Project Settings -> Environment Variables.

---

## Mock Mode (Current State)

> **This dashboard is currently running in MOCK MODE.** No real backend is connected. Every page renders pre-seeded data and every action updates in-memory React state only.

**What this means:**

- All 49 pages render with realistic sample data
- All flows are clickable and show the correct UX
- Changes persist within a session (until page refresh)
- Changes do **not** persist to any database
- Authentication is insecure (any email + 6+ char password works)
- Permission checks run client-side only (bypassable for demo purposes)

### Switching to Real API

When the backend is ready:

1. Set `NEXT_PUBLIC_USE_MOCKS=false`
2. Update `NEXT_PUBLIC_API_BASE_URL` to production API URL
3. The `ApiClient` in `src/lib/api.ts` already handles Bearer token auth, language headers, and error codes
4. Wire `AuthContext.login()` to call real `/auth/login` endpoint
5. Add server-side permission validation (middleware or API gateway)

---

## Deployment

This project auto-deploys to Vercel on every push to GitHub.

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | (set in Vercel) |
| `development` | Preview | Vercel generates preview URL per commit |

**Vercel setup:**

1. Connect GitHub repo in Vercel dashboard
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build` (default)
4. Environment variables: set `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_MOCKS`
5. Production branch: `main`

---

## Branch Strategy

```
main (production)
  |
  +-- development (active work, Vercel preview)
        |
        +-- feature/xyz (optional short-lived feature branches)
```

- All work lands in `development` first
- Merge `development` -> `main` via pull request when ready for production
- Vercel promotes the latest `main` commit to production automatically

---

## Demo Accounts

In mock mode, log in with any of these emails (any password with 6+ characters):

| Email | Role | Access |
|-------|------|--------|
| `superadmin@hagzy.com` | Super Admin | Everything + impersonate |
| `admin@hagzy.com` | Admin | Full CRUD, no impersonate |
| `moderator@hagzy.com` | Moderator | Reviews, content, support |
| `support@hagzy.com` | Support | Tickets + view-only |
| `finance@hagzy.com` | Finance | Subscriptions, finance, reports |
| `viewer@hagzy.com` | Viewer | Read-only everything |

---

## Project Structure

```
src/
  app/                    Next.js App Router pages (49 routes)
    page.tsx              Dashboard home
    login/                Authentication
    providers/            Service providers
    users/                End users + wallets
    subscriptions/        Plans, invoices, billing
    reviews/              Moderation + analytics
    reports/              5 report categories
    finance/              Commissions, payouts, tax
    marketing/            Ads, push, promo codes, campaigns
    support/              Tickets + thread view
    content/              Pages, templates, announcements
    settings/             8 settings sub-pages
    app-versions/
    system-health/
    audit-logs/
    localization/

  components/
    layout/               AppShell, Sidebar, TopBar
    tables/               DataTable with search/sort/filter/pagination
    admin/                FormModal, ConfirmModal, StatusBadge, PermissionGate
    ui/                   Button, Input, Select, etc.

  contexts/               Auth, Theme, Language, Settings contexts
  hooks/                  Custom hooks (useTranslation, usePermission, etc.)
  i18n/                   EN/AR translations
  lib/                    API client, utilities, validations, permissions
  mocks/                  Mock data per domain (providers, users, etc.)
  types/                  TypeScript type definitions
  middleware.ts           Route guards + RBAC
```

---

## Roadmap

### Phase 1 — MVP (Complete)
49 pages, 15 modules, mock data layer, CRUD modals, role-based access, Arabic/English + RTL, dark/light theme, responsive design.

### Phase 2 — Polish & Correctness (Complete)
All audit items closed:
- **Dead-end flows** — 9 `alert()` stubs and empty `onClick` handlers replaced with real FormModal / ConfirmModal workflows
- **Impersonation** — AuthContext state + sticky TopBar banner with Exit
- **Command Palette** — `cmdk`-powered global `Cmd/Ctrl+K` with 40+ route shortcuts and quick actions
- **Subscription extras** — Extend Trial, Generate Invoice (line-items + 14% VAT), Refund (partial/full, refund destination)
- **Form validation** — Zod v4 schemas (email, Egypt phone, password, provider/user/admin/plan/promo/ad) wired via `useValidatedForm` (RHF + zodResolver). Inline error rendering in `FormField`
- **Design system** — `src/components/admin/shared.module.css` primitives; 41 pages migrated from inline styles; hex colors swapped to CSS tokens for dark-mode compatibility
- **i18n** — 100% of pages use `useTranslation`; ~450 en/ar translation keys; `dir="rtl"` on all Arabic input fields
- **Toasts** — success/error/undo on every create/update/delete via `ToastProvider`
- **Empty states / loading / breadcrumbs** — `EmptyState` in every DataTable empty row; `Loader2` spinner in FormModal submit; auto-derived `Breadcrumbs` from pathname in `AppShell`
- **URL-persisted filters** — `useSearchParams()` on providers, users, reviews, support
- **Keyboard & mobile** — Escape-to-close on all modals, body-scroll lock, 640px responsive CSS
- **MobileBottomNav** — 5-icon bottom nav for mobile devices
- **Provider extras** — Adjust Commission modal, Export dropdown (Bookings / Employees / Financial Summary CSV)
- **Finance hub** — sub-nav cards (Commissions / Payouts / Invoices / Tax Reports)
- **Correctness** — AuthContext microtask fix, useApiQuery stale-closure fix via `useRef`, permission auto-assignment on admin create, null-safe `formatDate`, stable React keys

### Phase 3 — Backend Integration
- Wire `ApiClient` to real endpoints
- Add server-side permission validation
- Real authentication with OTP/MFA
- WebSocket for real-time support + audit logs
- Push notification delivery pipeline

### Phase 4 — Advanced Features
- Revenue forecasting (ML)
- Anomaly detection on audit logs
- A/B testing for ads
- Provider performance scoring
- Automated churn-risk alerts

---

## License

Proprietary (c) Waqty Platform. All rights reserved.

## Contact

For stakeholder questions about features, flows, or timelines:
- **Product**: [Contact product team]
- **Engineering**: [Contact engineering team]
- **Repo**: <https://github.com/waqtyPlatform/Waqty-Admin-Dashbored>
