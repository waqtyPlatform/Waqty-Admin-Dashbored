export type ReviewStatus = 'published' | 'flagged' | 'hidden' | 'pending';

export interface Review {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    provider_id: string;
    provider_name: string;
    booking_id: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
    flag_reason?: string;
    admin_response?: string;
    reported_count: number;
    created_at: string;
    updated_at: string;
}
