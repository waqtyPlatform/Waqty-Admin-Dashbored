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
    IsoDateTime,
} from '@/contract/waqty_contract';

/** Canonical plan + admin-only counters/audit (subscriptions list). */
export interface SubscriptionPlanRow extends SubscriptionPlan {
    providers_count: number;
    created_at: IsoDateTime;
    updated_at: IsoDateTime;
}

/** Canonical subscription + provider/plan display joins (admin list). */
export interface ProviderSubscriptionRow extends ProviderSubscription {
    provider_name: string;
    plan_name: string;
    plan_tier: PlanTier;
    payment_method: string;
    created_at: IsoDateTime;
    updated_at: IsoDateTime;
}

/** Canonical invoice + provider display name (admin list). */
export interface InvoiceRow extends Invoice {
    provider_name: string;
}
