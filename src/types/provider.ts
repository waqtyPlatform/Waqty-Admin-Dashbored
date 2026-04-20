export type ProviderStatus = 'active' | 'suspended' | 'blocked' | 'soft_deleted' | 'pending_review' | 'rejected' | 'deactivated';
export type BusinessCategory = 'salon' | 'barber' | 'clinic' | 'spa' | 'nails' | 'other';

export interface Provider {
    id: string;
    uuid: string;
    name: string;
    email: string;
    phone: string;
    business_name: string;
    business_category: BusinessCategory;
    status: ProviderStatus;
    subscription_plan_id: string | null;
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
    reviewed_by?: string;
    reviewed_at?: string;
    rejection_reason?: string;
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
