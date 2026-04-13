export type PlanTier = 'basic' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface SubscriptionPlan {
    id: string;
    name: string;
    name_ar: string;
    tier: PlanTier;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    features: PlanFeature[];
    limits: PlanLimits;
    active: boolean;
    trial_days: number;
    providers_count: number;
    created_at: string;
    updated_at: string;
}

export interface PlanFeature {
    key: string;
    label: string;
    label_ar: string;
    included: boolean;
}

export interface PlanLimits {
    max_branches: number;
    max_employees: number;
    max_services: number;
    max_bookings_per_month: number;
    storage_gb: number;
}

export interface ProviderSubscription {
    id: string;
    provider_id: string;
    provider_name: string;
    plan_id: string;
    plan_name: string;
    plan_tier: PlanTier;
    billing_cycle: BillingCycle;
    status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';
    current_period_start: string;
    current_period_end: string;
    trial_end: string | null;
    amount: number;
    currency: string;
    payment_method: string;
    auto_renew: boolean;
    created_at: string;
    updated_at: string;
}

export interface Invoice {
    id: string;
    provider_id: string;
    provider_name: string;
    subscription_id: string;
    amount: number;
    tax: number;
    total: number;
    currency: string;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded';
    issued_at: string;
    due_at: string;
    paid_at: string | null;
    pdf_url: string | null;
}
