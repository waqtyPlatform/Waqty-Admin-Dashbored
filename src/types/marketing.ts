export interface PushNotification {
    id: string;
    title: string;
    title_ar: string;
    body: string;
    body_ar: string;
    target_app: 'user' | 'employee' | 'all';
    target_segment: 'all' | 'active' | 'inactive' | 'new' | 'custom';
    scheduled_at: string | null;
    sent_at: string | null;
    status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
    recipients_count: number;
    opened_count: number;
    created_at: string;
}

export interface PromoCode {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    valid_from: string;
    valid_until: string;
    active: boolean;
    created_at: string;
}

export interface Campaign {
    id: string;
    name: string;
    description: string;
    type: 'featured_listing' | 'banner' | 'email' | 'push';
    status: 'draft' | 'active' | 'paused' | 'completed';
    start_date: string;
    end_date: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    created_at: string;
}

// X16 — the ads stream is now billable: an Ad is backed by the canonical
// `AdPlacement` (type banner|featured|top_search + price + currency + AdStatus),
// the 3rd platform revenue stream. The contract types are the source of truth.
import type { AdPlacement, AdType, AdStatus } from '@/contract/waqty_contract';
export type { AdPlacement, AdType, AdStatus } from '@/contract/waqty_contract';

// Where an ad RENDERS in the apps (a UI slot) — distinct from the canonical
// `AdType`, which is the billable product purchased. Mapped onto the canonical
// `AdPlacement.placement` string when the record is created.
export type AdSlot = 'home_banner' | 'category_banner' | 'search_promoted' | 'between_listings';

// Admin view-model: the billable canonical `AdPlacement` plus the creative /
// targeting / analytics metadata the wire record intentionally omits.
export interface Ad {
    id: string;
    placement: AdPlacement; // canonical billable record — type, price, currency, status, dates
    providerName: string;   // resolved from placement.provider_uuid
    slot: AdSlot;           // UI render location
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    image_url: string;
    target_url: string;
    targeting: {
        cities: string[];
        categories: string[];
        user_segments: string[];
    };
    priority: number;
    analytics: {
        impressions: number;
        clicks: number;
        ctr: number;
        conversions: number;
    };
}
