/**
 * Platform finance — DERIVED from paid Visits (SA-2 / SA-3).
 *
 * The commission ledger, payouts and revenue summary are computed from
 * `mockVisits` + each provider's commission rate using the canonical
 * `contract/platform_finance.ts` helpers. No hand-aggregated money mocks —
 * the numbers reconcile with the provider's net by construction.
 */
import type { Uuid } from '@/contract/waqty_contract';
import {
    isBilled,
    commissionForVisit,
    buildPayouts,
    platformRevenueSummary,
} from '@/contract/platform_finance';
import { mockVisits } from '@/mocks/visits';
import { mockProviders } from '@/mocks/providers';
import type { PlatformCommissionRow, PayoutRow } from '@/types/finance';

/**
 * provider_uuid -> commission_rate as a 0..1 fraction.
 * Mock providers already store the rate as a fraction (0.10 = 10%), matching the
 * canonical money math, so this is a straight pass-through (no scaling hack).
 */
export const commissionRateByProvider: Record<Uuid, number> = Object.fromEntries(
    mockProviders.map(p => [p.uuid, p.commission_rate ?? 0]),
);

const providerName = (uuid: Uuid): string =>
    mockProviders.find(p => p.uuid === uuid)?.business_name ?? uuid;

/** Per-booking commission ledger, derived from each billed visit. */
export const platformCommissions: PlatformCommissionRow[] = mockVisits
    .filter(isBilled)
    .map(v => ({
        ...commissionForVisit(v, commissionRateByProvider[v.provider_uuid] ?? 0),
        provider_name: providerName(v.provider_uuid),
    }));

/** One payout per provider per period, netting commission + fees. */
export const platformPayouts: PayoutRow[] = buildPayouts(mockVisits, commissionRateByProvider)
    .map(p => ({ ...p, provider_name: providerName(p.provider_uuid) }));

/** Platform-side roll-up across billed visits. */
export const revenueSummary = platformRevenueSummary(mockVisits, commissionRateByProvider);

/* ---------------- aggregate chart data (reports/finance overview) ---------------- */

// Aggregate revenue series — canonical Money (MINOR units; 100 = EGP 1.00), so
// it renders through the market formatter like all platform money (FU/minor sweep).
export const monthlyRevenueData = [
    { month: 'Oct', subscriptions: 22500000, commissions: 11500000, total: 34000000 },
    { month: 'Nov', subscriptions: 24000000, commissions: 12500000, total: 36500000 },
    { month: 'Dec', subscriptions: 26000000, commissions: 13800000, total: 39800000 },
    { month: 'Jan', subscriptions: 27500000, commissions: 14200000, total: 41700000 },
    { month: 'Feb', subscriptions: 29000000, commissions: 15500000, total: 44500000 },
    { month: 'Mar', subscriptions: 31000000, commissions: 16800000, total: 47800000 },
    { month: 'Apr', subscriptions: 34000000, commissions: 18000000, total: 52000000 },
];

export const bookingTrendsData = [
    { month: 'Oct', bookings: 12400, completed: 10800, cancelled: 1200, noShow: 400 },
    { month: 'Nov', bookings: 13200, completed: 11500, cancelled: 1300, noShow: 400 },
    { month: 'Dec', bookings: 14800, completed: 12900, cancelled: 1400, noShow: 500 },
    { month: 'Jan', bookings: 15200, completed: 13200, cancelled: 1500, noShow: 500 },
    { month: 'Feb', bookings: 16100, completed: 14000, cancelled: 1600, noShow: 500 },
    { month: 'Mar', bookings: 17500, completed: 15200, cancelled: 1700, noShow: 600 },
    { month: 'Apr', bookings: 18900, completed: 16400, cancelled: 1800, noShow: 700 },
];

// `revenue` is canonical Money (MINOR units); providers/users/bookings are counts.
export const geographicData = [
    { city: 'Cairo', providers: 520, users: 22000, bookings: 85000, revenue: 120000000 },
    { city: 'Alexandria', providers: 180, users: 8500, bookings: 28000, revenue: 38000000 },
    { city: 'Giza', providers: 145, users: 6200, bookings: 19000, revenue: 26000000 },
    { city: 'Mansoura', providers: 85, users: 3100, bookings: 8500, revenue: 11500000 },
    { city: 'Tanta', providers: 62, users: 2400, bookings: 5800, revenue: 7800000 },
    { city: 'Aswan', providers: 45, users: 1800, bookings: 4200, revenue: 5600000 },
    { city: 'Luxor', providers: 38, users: 1500, bookings: 3500, revenue: 4700000 },
    { city: 'Port Said', providers: 32, users: 1200, bookings: 2800, revenue: 3800000 },
];
