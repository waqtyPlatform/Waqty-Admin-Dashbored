/**
 * ============================================================================
 *  WAQTY / HAGZY — CANONICAL ECOSYSTEM CONTRACT  (Phase 0)
 *  Source of truth for all four apps. Prepared for Yossef — 2026-05-28.
 * ----------------------------------------------------------------------------
 *  This file is the single shared contract. The two web dashboards import these
 *  types directly; the two Flutter apps mirror them in waqty_contract.dart.
 *  JSON shape == this file (snake_case). Dart maps snake_case <-> camelCase.
 *
 *  CONVENTIONS (decided in the gap analysis):
 *   - IDs:        `uuid` (string) is the primary key and FK on every relation.
 *   - Dates:      ISO-8601 strings. IsoDate = "YYYY-MM-DD", IsoDateTime full,
 *                 TimeStr = "HH:mm".
 *   - Money:      integer MINOR UNITS (piastres). 100 = EGP 1.00. Never floats.
 *                 Currency is carried by MarketConfig / the owning entity.
 *   - Localized:  parallel fields `x` (en) + `x_ar` (ar). Egypt default locale
 *                 is Arabic. The User app's LocStr wraps these two fields.
 *   - Geography:  country / currency / locale are CONFIG, never hardcoded.
 *                 Egypt is the launch default; GCC drops in via MarketConfig.
 *   - Status:     one shared enum per concept (below). Persistent status is
 *                 separate from time-derived display state (upcoming/arrived).
 * ============================================================================
 */

/* ------------------------------------------------------------------ scalars */
export type Uuid = string;          // primary key / foreign key
export type IsoDate = string;       // "2026-05-28"
export type IsoDateTime = string;   // "2026-05-28T14:30:00Z"
export type TimeStr = string;       // "14:30"
export type Money = number;         // integer minor units (piastres); 100 = EGP 1.00
export type CurrencyCode = string;  // ISO 4217, e.g. "EGP"
export type CountryCode = string;   // ISO 3166-1 alpha-2, e.g. "EG"
export type LocaleCode = "ar" | "en";

/* -------------------------------------------------------------------- enums */
// Unified booking lifecycle. Replaces: User{upcoming,completed,canceled},
// Employee{confirmed,processing,upcoming,completed,canceled,noShow},
// web{pending,confirmed,completed,cancelled,no_show}. (Note spelling.)
export type BookingStatus =
  | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  "pending", "confirmed", "in_progress", "completed", "cancelled", "no_show",
];

export type BusinessCategory = "salon" | "barber" | "clinic" | "spa" | "nails" | "other";

export const BUSINESS_CATEGORIES: readonly BusinessCategory[] = [
  "salon", "barber", "clinic", "spa", "nails", "other",
];

// Deterministic mapping from a raw provider category string (API value, English
// or Arabic) to the canonical enum — replaces ad-hoc `.includes()` matching
// scattered across the apps.
export function normalizeBusinessCategory(raw?: string | null): BusinessCategory {
  const c = (raw ?? "").toLowerCase();
  if (c.includes("clinic") || c.includes("عياد") || c.includes("طب")) return "clinic";
  if (c.includes("barber") || c.includes("حلاق") || c.includes("باربر")) return "barber";
  if (c.includes("spa") || c.includes("سبا") || c.includes("منتجع")) return "spa";
  if (c.includes("nail") || c.includes("أظافر") || c.includes("اظافر")) return "nails";
  if (c.includes("salon") || c.includes("صالون") || c.includes("تجميل")) return "salon";
  return "other";
}

// Type-specific terminology + intake behaviour driven off the canonical category,
// so switching `business_category` changes wording/intake deterministically
// instead of relying on string checks at call sites.
export interface BusinessTerminology {
  label: string;            // "Salon" / "Clinic"
  customer: string;         // "Client" / "Patient"
  staff: string;            // "Stylist" / "Doctor"
  appointment: string;      // "Appointment" / "Visit"
  requiresIntake: boolean;  // clinic intake form
}
export const BUSINESS_TERMINOLOGY: Record<BusinessCategory, BusinessTerminology> = {
  salon:  { label: "Salon",    customer: "Client",  staff: "Stylist",     appointment: "Appointment", requiresIntake: false },
  barber: { label: "Barber",   customer: "Client",  staff: "Barber",      appointment: "Appointment", requiresIntake: false },
  clinic: { label: "Clinic",   customer: "Patient", staff: "Doctor",      appointment: "Visit",       requiresIntake: true  },
  spa:    { label: "Spa",      customer: "Guest",   staff: "Therapist",   appointment: "Appointment", requiresIntake: false },
  nails:  { label: "Nails",    customer: "Client",  staff: "Nail Artist", appointment: "Appointment", requiresIntake: false },
  other:  { label: "Business", customer: "Client",  staff: "Staff",       appointment: "Appointment", requiresIntake: false },
};

export type ProviderStatus =
  | "active" | "suspended" | "blocked" | "soft_deleted"
  | "pending_review" | "rejected" | "deactivated";

// Customer -> Provider payment. All three coexist, chosen per service.
export type PaymentModel = "online_upfront" | "deposit_balance" | "cash";
export type PaymentMethod = "card" | "wallet" | "fawry" | "vodafone_cash" | "cash";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded" | "failed";

export type ReviewStatus = "pending" | "published" | "flagged" | "hidden";
export type CommissionType = "percentage" | "fixed";
export type WaitlistStatus = "waiting" | "notified" | "booked" | "cancelled";
export type LoyaltyTxnType = "earn" | "redeem" | "adjust" | "expire";

// Platform -> Provider subscription
export type PlanTier = "basic" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "trial" | "past_due" | "cancelled" | "expired";

// Platform money layer
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";
export type AdType = "banner" | "featured" | "top_search";
export type AdStatus = "scheduled" | "active" | "paused" | "ended";

/* ------------------------------------------------------------------- config */
// Egypt-first, configurable. One row per active market.
export interface MarketConfig {
  country: CountryCode;            // default "EG"
  currency: CurrencyCode;          // default "EGP"
  default_locale: LocaleCode;      // default "ar"
  dialing_code: string;            // default "+20"
  minor_units_per_major: number;   // 100
  vat_rate: number;                // e.g. 0.14 (configurable per market)
}

/* =================================================================== PEOPLE */

// ONE GLOBAL customer, keyed by phone. (Today: a bare string in Employee app,
// absent in User app.) Each provider sees their slice via CustomerProviderProfile.
export interface Customer {
  uuid: Uuid;
  phone: string;                   // GLOBAL unique key — "one phone = one user"
  name: string;
  name_ar?: string;
  email?: string | null;
  avatar_url?: string | null;
  date_of_birth?: IsoDate | null;
  gender?: "male" | "female" | "other" | null;
  default_locale: LocaleCode;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

// A provider's private view of a global Customer. Medical/notes stay here,
// scoped to the provider — never on the global Customer.
export interface CustomerProviderProfile {
  uuid: Uuid;
  customer_uuid: Uuid;
  provider_uuid: Uuid;
  group_uuid?: Uuid | null;
  vip: boolean;
  notes?: string | null;
  allergies?: string | null;       // clinic
  medical_conditions?: string | null;
  medications?: string | null;
  total_visits: number;
  total_spent: Money;
  last_visit?: IsoDateTime | null;
  loyalty_points: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

// Staff member. Reconciles backend Employee + User-app Specialist (rating/reviews)
// + Employee-app User (employee_number/role/department).
export interface Employee {
  uuid: Uuid;
  provider_uuid: Uuid;
  branch_uuid: Uuid;
  employee_number?: string | null;
  name: string;
  name_ar?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;            // "Senior Stylist", "Doctor", ...
  department?: string | null;
  avatar_url?: string | null;
  rating?: number | null;          // 0..5  (was only on User-app Specialist)
  reviews_count?: number | null;
  active: boolean;
  blocked: boolean;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

/* ================================================================ PROVIDERS */

export interface Provider {
  uuid: Uuid;
  name: string;
  name_ar?: string;
  business_category: BusinessCategory;
  email: string;
  phone: string;
  status: ProviderStatus;
  country: CountryCode;
  city: string;
  commission_rate: number;         // platform commission %, 0..1 (see PlatformCommission)
  subscription_plan_uuid?: Uuid | null;
  subscription_status: SubscriptionStatus;
  branches_count: number;
  employees_count: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface Branch {
  uuid: Uuid;
  provider_uuid: Uuid;
  name: string;
  name_ar?: string;
  phone: string;
  country: CountryCode;
  city: string;
  address: string;
  lat?: number | null;             // Egypt default centre, not Riyadh
  lng?: number | null;
  is_main: boolean;
  active: boolean;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

/* ================================================================== CATALOG */

export interface ServiceCategory {
  uuid: Uuid;
  provider_uuid?: Uuid | null;     // null = platform-level category
  parent_uuid?: Uuid | null;       // sub-category if set
  name: string;
  name_ar: string;
  active: boolean;
}

// Service carries NO price. Pricing lives in ServicePrice (tiered / groups).
export interface Service {
  uuid: Uuid;
  provider_uuid: Uuid;
  sub_category_uuid?: Uuid | null;
  name: string;
  name_ar: string;
  description?: string | null;
  description_ar?: string | null;
  estimated_duration_minutes: number;   // canonical duration field name
  image_url?: string | null;
  active: boolean;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

// Tiered price for a service (optionally per pricing-group / per specialist tier).
export interface ServicePrice {
  uuid: Uuid;
  service_uuid: Uuid;
  pricing_group_uuid?: Uuid | null;
  employee_uuid?: Uuid | null;     // optional per-specialist price tier
  label?: string | null;
  label_ar?: string | null;
  price: Money;
  currency: CurrencyCode;
  active: boolean;
}

export interface Package {
  uuid: Uuid;
  provider_uuid: Uuid;
  name: string;
  name_ar: string;
  service_uuids: Uuid[];
  duration_minutes: number;
  original_price: Money;
  price: Money;
  currency: CurrencyCode;
  image_url?: string | null;
  active: boolean;
}

/* ============================================================== AVAILABILITY */
// Bookable availability the User app reads when picking a slot for a line-item.
export interface AvailabilitySlot {
  start_time: TimeStr;             // "14:30"
  end_time: TimeStr;               // "15:15"
  available: boolean;
  employee_uuid?: Uuid | null;     // null = any available specialist
}
export interface AvailableDay {
  date: IsoDate;                   // "2026-05-30"
  has_availability: boolean;
  slots?: AvailabilitySlot[];
}

/* ============================================ THE VISIT (multi-line booking) */

// A Visit is a basket of line-items. Each line is one service with its OWN
// optional specialist and time slot. This replaces all four divergent Booking
// shapes. Booking == Visit.
export interface Visit {
  uuid: Uuid;
  provider_uuid: Uuid;
  branch_uuid: Uuid;
  customer_uuid: Uuid;             // FK to the global Customer (never a name string)
  status: BookingStatus;
  scheduled_start: IsoDateTime;
  scheduled_end?: IsoDateTime | null;
  line_items: VisitLineItem[];
  payment: Payment;
  subtotal: Money;
  discount_total: Money;
  tip_total: Money;
  total: Money;
  currency: CurrencyCode;
  promo_code?: string | null;
  notes?: string | null;
  visit_number?: number | null;    // nth visit of this customer to this provider
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  started_at?: IsoDateTime | null;
  completed_at?: IsoDateTime | null;
}

export interface VisitLineItem {
  uuid: Uuid;
  visit_uuid: Uuid;
  service_uuid: Uuid;
  employee_uuid?: Uuid | null;     // null = "any available" (optional specialist)
  start_time: IsoDateTime;
  duration_minutes: number;
  price: Money;
  status?: BookingStatus;          // per-line status (a visit can be partly done)
  commission_amount?: Money;       // staff commission accrued for this line
}

/* ================================================================= PAYMENTS */

// One Payment per Visit. Branches on `model`. platform_fee + commission_amount
// are how the platform earns on each transaction.
export interface Payment {
  uuid?: Uuid;
  visit_uuid: Uuid;
  model: PaymentModel;
  method?: PaymentMethod | null;
  status: PaymentStatus;
  total: Money;
  paid_amount: Money;              // online_upfront: = total; deposit_balance: deposit; cash: 0 until done
  balance_amount: Money;           // remainder due in person
  currency: CurrencyCode;
  platform_fee: Money;             // user transaction fee (see TransactionFee)
  commission_amount: Money;        // platform commission (see PlatformCommission)
  paid_at?: IsoDateTime | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

/* ====================================================== REVIEWS (MVP entity) */

// Unified. The User app CREATES these (it has no model today); SuperAdmin moderates.
export interface Review {
  uuid: Uuid;
  visit_uuid: Uuid;
  customer_uuid: Uuid;
  provider_uuid: Uuid;
  employee_uuid?: Uuid | null;     // review a specific specialist if relevant
  rating: number;                  // 1..5
  comment?: string | null;
  status: ReviewStatus;
  provider_response?: string | null;
  admin_response?: string | null;
  flag_reason?: string | null;
  reported_count: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

/* ================================================ TIPS / LOYALTY / WAITLIST */
/* (MVP entities — none exist in any app today) */

export interface Tip {
  uuid: Uuid;
  visit_uuid: Uuid;
  customer_uuid: Uuid;
  employee_uuid: Uuid;             // tip is attributed to a specific staffer
  amount: Money;
  currency: CurrencyCode;
  created_at: IsoDateTime;
}

export interface LoyaltyAccount {
  uuid: Uuid;
  customer_uuid: Uuid;
  provider_uuid?: Uuid | null;     // null = platform-wide loyalty
  points_balance: number;
  tier?: string | null;
  updated_at: IsoDateTime;
}

export interface LoyaltyTransaction {
  uuid: Uuid;
  loyalty_account_uuid: Uuid;
  type: LoyaltyTxnType;
  points: number;                  // +earn / -redeem
  visit_uuid?: Uuid | null;
  reason?: string | null;
  created_at: IsoDateTime;
}

export interface WaitlistEntry {
  uuid: Uuid;
  provider_uuid: Uuid;
  branch_uuid: Uuid;
  customer_uuid: Uuid;
  service_uuid?: Uuid | null;
  status: WaitlistStatus;
  requested_date?: IsoDate | null;
  position?: number | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

/* ================================================= MARKETING (offers/promos) */

export interface Offer {
  uuid: Uuid;
  provider_uuid: Uuid;
  name: string;
  name_ar: string;
  type: "percentage" | "fixed" | "bundle" | "free_service";
  value: number;
  min_purchase?: Money | null;
  service_uuids: Uuid[];
  start_date: IsoDate;
  end_date: IsoDate;
  usage_limit?: number | null;
  usage_count: number;
  active: boolean;
}

export interface PromoCode {
  uuid: Uuid;
  code: string;
  provider_uuid?: Uuid | null;     // null = platform-wide
  type: CommissionType;            // percentage | fixed
  value: number;
  min_purchase?: Money | null;
  valid_from: IsoDate;
  valid_to: IsoDate;
  usage_limit?: number | null;
  usage_count: number;
  active: boolean;
}

/* ========================================= PLATFORM MONEY LAYER (4 streams) */

/* 1) Subscriptions — unified shape (was two: SuperAdmin rich + Provider simple) */
export interface PlanFeature { key: string; label: string; label_ar: string; included: boolean; }
export interface PlanLimits {
  max_branches: number; max_employees: number; max_services: number;
  max_bookings_per_month: number; storage_gb: number;
}
export interface SubscriptionPlan {
  uuid: Uuid;
  name: string;
  name_ar: string;
  tier: PlanTier;
  price_monthly: Money;
  price_yearly: Money;
  currency: CurrencyCode;
  features: PlanFeature[];
  limits: PlanLimits;
  trial_days: number;
  active: boolean;
}
export interface ProviderSubscription {
  uuid: Uuid;
  provider_uuid: Uuid;
  plan_uuid: Uuid;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  current_period_start: IsoDateTime;
  current_period_end: IsoDateTime;
  trial_end?: IsoDateTime | null;
  amount: Money;
  currency: CurrencyCode;
  auto_renew: boolean;
}
export interface Invoice {
  uuid: Uuid;
  provider_uuid: Uuid;
  subscription_uuid?: Uuid | null;
  amount: Money; tax: Money; total: Money; currency: CurrencyCode;
  status: "paid" | "pending" | "overdue" | "cancelled" | "refunded";
  issued_at: IsoDateTime; due_at: IsoDateTime; paid_at?: IsoDateTime | null;
  pdf_url?: string | null;
}

/* 2) Per-booking commission — NEW ledger (only commission_rate existed before) */
export interface PlatformCommission {
  uuid: Uuid;
  provider_uuid: Uuid;
  visit_uuid: Uuid;
  gross_amount: Money;
  commission_rate: number;         // 0..1, from Provider.commission_rate at time of booking
  commission_amount: Money;
  provider_net: Money;             // gross - commission - fees
  currency: CurrencyCode;
  period: string;                  // "2026-05"
  created_at: IsoDateTime;
}

/* 3) Provider payout / settlement — NEW */
export interface Payout {
  uuid: Uuid;
  provider_uuid: Uuid;
  period_start: IsoDate;
  period_end: IsoDate;
  gross: Money;
  commission_total: Money;
  fees_total: Money;
  net_payable: Money;
  currency: CurrencyCode;
  status: PayoutStatus;
  reference?: string | null;
  paid_at?: IsoDateTime | null;
  created_at: IsoDateTime;
}

/* 4) User transaction fee — NEW (captured during payment) */
export interface TransactionFee {
  uuid: Uuid;
  visit_uuid: Uuid;
  payment_uuid: Uuid;
  amount: Money;
  rate?: number | null;            // 0..1 if percentage-based
  currency: CurrencyCode;
  created_at: IsoDateTime;
}

/* Ads / featured listings — NEW (3rd revenue stream) */
export interface AdPlacement {
  uuid: Uuid;
  provider_uuid: Uuid;
  type: AdType;
  placement: string;               // where it shows, e.g. "home_top", "category:salon"
  start_date: IsoDate;
  end_date: IsoDate;
  price: Money;
  currency: CurrencyCode;
  status: AdStatus;
  created_at: IsoDateTime;
}

/* ============================== STAFF EARNINGS (Provider -> Employee, internal) */

export interface CommissionRule {
  uuid: Uuid;
  provider_uuid: Uuid;
  name: string;
  service_uuid?: Uuid | null;
  type: CommissionType;
  value: number;                   // % (0..1) or fixed Money
  min_target?: Money | null;
  tier_multiplier: number;
  active: boolean;
}
export interface EmployeeCommission {
  uuid: Uuid;
  employee_uuid: Uuid;
  service_uuid: Uuid;
  visit_uuid?: Uuid | null;
  line_item_uuid?: Uuid | null;    // ties to the exact VisitLineItem performed
  amount: Money;
  rate: number;
  type: CommissionType;
  period: string;                  // "2026-05"
  created_at: IsoDateTime;
}
export interface Payslip {
  uuid: Uuid;
  employee_uuid: Uuid;
  period: string;
  base_salary: Money;
  commission_total: Money;
  tips_total: Money;               // tips now modelled and surfaced
  bonus_total: Money;
  deduction_total: Money;
  net_pay: Money;
  currency: CurrencyCode;
  status: "pending" | "paid";
  issued_at: IsoDateTime;
}
