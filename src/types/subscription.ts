/**
 * Subscriptions / billing — canonical types (SA-7 / SA-2 / SA-8).
 *
 * SubscriptionPlan, ProviderSubscription and Invoice are the canonical entities
 * from the shared contract (uuid-keyed, money in minor units). SuperAdmin DEFINES
 * plans here and the Provider dashboard CONSUMES the identical shape. Admin list
 * views extend (never redefine) the canonical entity with display joins via a
 * `*Row` view-model.
 */
export type {
    PlanTier,
    BillingCycle,
    SubscriptionStatus,
    PlanFeature,
    PlanLimits,
    SubscriptionPlan,
    ProviderSubscription,
    Invoice,
} from '@/contract/waqty_contract';

import type {
    SubscriptionPlan,
    ProviderSubscription,
    Invoice,
    PlanTier,
    BillingCycle,
    IsoDateTime,
} from '@/contract/waqty_contract';

/** Canonical plan + admin-only counters/audit (subscriptions list). */
export interface SubscriptionPlanRow extends SubscriptionPlan {
    providers_count: number;
    created_at: IsoDateTime;
    updated_at: IsoDateTime;
}

/**
 * How the platform bills a provider:
 *  - 'subscription' — a flat recurring plan fee (monthly/yearly) — the original model.
 *  - 'commission'   — no flat fee; the platform instead takes a percentage of the
 *                     provider's booking revenue (`commission_rate`).
 */
export type SubscriptionBillingType = 'subscription' | 'commission';

/** Canonical subscription + provider/plan display joins (admin list). */
export interface ProviderSubscriptionRow extends ProviderSubscription {
    provider_name: string;
    plan_name: string;
    plan_tier: PlanTier;
    payment_method: string;
    created_at: IsoDateTime;
    updated_at: IsoDateTime;
    /** Billing model. Admin-managed; not part of the canonical subscription entity. */
    billing_type: SubscriptionBillingType;
    /** Platform cut as a 0..1 FRACTION (0.12 = 12%). Used when billing_type === 'commission'. */
    commission_rate: number;
}

/** Canonical invoice + provider display name (admin list). */
export interface InvoiceRow extends Invoice {
    provider_name: string;
}

/**
 * A reusable COMMISSION plan — the admin defines it once (a named rate + settlement
 * terms) and assigns it to commission-billed providers, exactly as SubscriptionPlan
 * works for flat-fee providers. Commission billing is an admin-managed concept, so
 * this is NOT part of the canonical contract.
 */
export interface CommissionPlan {
    uuid: string;
    name: string;
    name_ar: string;
    /** Platform cut as a 0..1 FRACTION (0.12 = 12%). */
    commission_rate: number;
    /** How often the platform settles / deducts the commission. */
    settlement_cycle: BillingCycle;
    /** Optional monthly minimum fee floor in MINOR units (0 = none). */
    min_monthly_fee: number;
    /** Perks / terms included — shown on the plan card. */
    features: string[];
    features_ar: string[];
    active: boolean;
}

/** Commission plan + admin counters/audit (commission-plans list). */
export interface CommissionPlanRow extends CommissionPlan {
    providers_count: number;
    created_at: IsoDateTime;
    updated_at: IsoDateTime;
}
