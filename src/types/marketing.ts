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

export type AdPlacement = 'home_banner' | 'category_banner' | 'search_promoted' | 'between_listings';
export type AdType = 'image_banner' | 'promotional_card' | 'featured_provider' | 'video_ad';

export interface Ad {
    id: string;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    image_url: string;
    target_url: string;
    placement: AdPlacement;
    ad_type: AdType;
    targeting: {
        cities: string[];
        categories: string[];
        user_segments: string[];
    };
    schedule: {
        start_date: string;
        end_date: string;
    };
    priority: number;
    status: 'draft' | 'active' | 'paused' | 'expired';
    analytics: {
        impressions: number;
        clicks: number;
        ctr: number;
        conversions: number;
    };
    created_at: string;
    updated_at: string;
}
