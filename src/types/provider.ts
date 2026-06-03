import type {
    Provider as CanonicalProvider,
    ProviderStatus,
    BusinessCategory,
} from '@/contract/waqty_contract';

// Canonical enums are the source of truth; re-exported so existing
// `@/types/provider` imports keep resolving (the unions are identical).
export type { ProviderStatus, BusinessCategory } from '@/contract/waqty_contract';

// The admin's Provider is the CANONICAL Provider plus admin-only aggregates and
// audit fields (G3). It no longer re-declares the ecosystem entity — it extends
// it — so the cross-app shape can't drift. `id` is a legacy admin row id (CSV
// filenames / table keys); `uuid` is the ecosystem key. `name_ar` is widened to
// allow null for admin rows. Money fields (total_revenue) are canonical MINOR
// units. `commission_rate`, `subscription_status`, etc. come from the canonical.
export type Provider = Omit<CanonicalProvider, 'name_ar'> & {
    name_ar: string | null;
    id: string;
    business_name: string;
    total_bookings: number;
    total_revenue: number;
    registered_at: string;
    verified_at: string | null;
    last_active_at: string;
    deleted_at: string | null;
};

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
