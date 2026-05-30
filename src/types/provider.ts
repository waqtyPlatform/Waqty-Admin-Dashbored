export type ProviderStatus = 'active' | 'suspended' | 'blocked' | 'soft_deleted' | 'pending_review' | 'rejected' | 'deactivated';
export type BusinessCategory = 'salon' | 'barber' | 'clinic' | 'spa' | 'nails' | 'other';

export interface Provider {
    id: string;
    uuid: string;
    name: string;
    name_ar: string | null;
    email: string;
    phone: string;
    business_name: string;
    business_category: BusinessCategory;
    status: ProviderStatus;
    // Join key onto a subscription plan — the plan's `uuid` (X12), not a legacy id.
    subscription_plan_uuid: string | null;
    subscription_status: 'active' | 'trial' | 'expired' | 'cancelled' | 'past_due';
    country: string;
    city: string;
    branches_count: number;
    employees_count: number;
    total_bookings: number;
    total_revenue: number;
    commission_rate: number;
    registered_at: string;
    verified_at: string | null;
    last_active_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ProviderRegistration {
    id: string;
    provider_name: string;
    business_name: string;
    business_category: BusinessCategory;
    email: string;
    phone: string;
    documents: { type: string; url: string; verified: boolean }[];
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    // Audit trail — who/when/why an explicit approve|reject decision was recorded.
    reviewed_by?: string | null;       // admin uuid
    reviewed_by_name?: string | null;  // admin display name
    reviewed_at?: string | null;       // ISO timestamp of the decision
    rejection_reason?: string | null;  // required when rejected
    approval_note?: string | null;     // optional note when approved
}

export interface ProviderBranch {
    id: string;
    uuid: string;
    name: string;
    phone: string;
    city: string;
    address: string;
    is_main: boolean;
    employees_count: number;
    active: boolean;
}
