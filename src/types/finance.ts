/**
 * Platform money layer — canonical types (SA-2 / SA-8).
 *
 * The commission ledger, payouts and transaction fees are the canonical
 * entities from the shared contract. Admin list views additionally need the
 * provider's display name joined in, so we extend (never redefine) the
 * canonical entity with a `*Row` view-model.
 */
export type {
    PlatformCommission,
    Payout,
    TransactionFee,
    PayoutStatus,
} from '@/contract/waqty_contract';
export type { PlatformRevenueSummary } from '@/contract/platform_finance';

import type { PlatformCommission, Payout } from '@/contract/waqty_contract';

/** Commission ledger entry + provider display name (admin list). */
export interface PlatformCommissionRow extends PlatformCommission {
    provider_name: string;
}

/** Provider payout/settlement + provider display name (admin list). */
export interface PayoutRow extends Payout {
    provider_name: string;
}
