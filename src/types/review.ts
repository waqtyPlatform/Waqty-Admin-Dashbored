/**
 * Reviews — canonical types (SA-4 / SA-8).
 *
 * The User app CREATES canonical `Review`s; SuperAdmin MODERATES them
 * (status pending -> published | flagged | hidden, with an optional
 * `admin_response`). The moderation queue extends the canonical entity with
 * user/provider display names via a `*Row` view-model.
 */
export type { Review, ReviewStatus } from '@/contract/waqty_contract';

import type { Review } from '@/contract/waqty_contract';

/** Canonical review + user/provider display names (moderation queue). */
export interface ReviewRow extends Review {
    user_name: string;
    provider_name: string;
}
