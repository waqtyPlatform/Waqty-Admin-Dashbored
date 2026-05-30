// MVP engagement loops surfaced to the admin (X13): tips, loyalty and waitlist.
// Each row EMBEDS the canonical contract entity (Tip / LoyaltyAccount /
// LoyaltyTransaction / WaitlistEntry) verbatim and pairs it with the display
// names the wire entities intentionally omit (they carry only uuids). This keeps
// the rows typed to the contract while staying readable/reportable in the admin —
// the same loop the User and Employee apps write into now closes at the admin end.
//
// Money is canonical Money — integer MINOR units (100 = EGP 1.00).
import type {
    Tip,
    LoyaltyAccount,
    LoyaltyTransaction,
    WaitlistEntry,
} from '@/contract/waqty_contract';

export interface TipReportRow {
    tip: Tip;
    customerName: string;
    employeeName: string;
    providerName: string;
}

export interface LoyaltyAccountRow {
    account: LoyaltyAccount;
    customerName: string;
    providerName: string; // resolved from provider_uuid, or "Platform-wide"
}

export interface LoyaltyTransactionRow {
    txn: LoyaltyTransaction;
    customerName: string;
}

export interface WaitlistReportRow {
    entry: WaitlistEntry;
    customerName: string;
    providerName: string;
    serviceName: string | null;
}

export const mockTipRows: TipReportRow[] = [
    {
        tip: { uuid: 'tip-001', visit_uuid: 'visit-1001', customer_uuid: 'usr-001', employee_uuid: 'emp-2', amount: 5000, currency: 'EGP', created_at: '2026-05-29T13:20:00Z' },
        customerName: 'Fatima Al-Rashid', employeeName: 'Sarah Ahmed', providerName: 'Glamour Studio',
    },
    {
        tip: { uuid: 'tip-002', visit_uuid: 'visit-1002', customer_uuid: 'usr-002', employee_uuid: 'emp-7', amount: 3000, currency: 'EGP', created_at: '2026-05-29T16:05:00Z' },
        customerName: 'Mohamed Ahmed', employeeName: 'Omar Khaled', providerName: 'Elite Barbers',
    },
    {
        tip: { uuid: 'tip-003', visit_uuid: 'visit-1003', customer_uuid: 'usr-003', employee_uuid: 'emp-3', amount: 7500, currency: 'EGP', created_at: '2026-05-28T11:45:00Z' },
        customerName: 'Layla Mahmoud', employeeName: 'Nora Ali', providerName: 'Royal Spa & Wellness',
    },
    {
        tip: { uuid: 'tip-004', visit_uuid: 'visit-1004', customer_uuid: 'usr-004', employee_uuid: 'emp-2', amount: 10000, currency: 'EGP', created_at: '2026-05-28T18:30:00Z' },
        customerName: 'Khaled Samir', employeeName: 'Sarah Ahmed', providerName: 'Glamour Studio',
    },
    {
        tip: { uuid: 'tip-005', visit_uuid: 'visit-1005', customer_uuid: 'usr-005', employee_uuid: 'emp-9', amount: 2500, currency: 'EGP', created_at: '2026-05-27T10:10:00Z' },
        customerName: 'Reem Adel', employeeName: 'Hana Youssef', providerName: 'Glow Skin Clinic',
    },
];

export const mockLoyaltyAccountRows: LoyaltyAccountRow[] = [
    {
        account: { uuid: 'loy-001', customer_uuid: 'usr-001', provider_uuid: null, points_balance: 1840, tier: 'Gold', updated_at: '2026-05-29T13:20:00Z' },
        customerName: 'Fatima Al-Rashid', providerName: 'Platform-wide',
    },
    {
        account: { uuid: 'loy-002', customer_uuid: 'usr-002', provider_uuid: 'prov-002', points_balance: 620, tier: 'Silver', updated_at: '2026-05-29T16:05:00Z' },
        customerName: 'Mohamed Ahmed', providerName: 'Elite Barbers',
    },
    {
        account: { uuid: 'loy-003', customer_uuid: 'usr-003', provider_uuid: null, points_balance: 3120, tier: 'Platinum', updated_at: '2026-05-28T11:45:00Z' },
        customerName: 'Layla Mahmoud', providerName: 'Platform-wide',
    },
    {
        account: { uuid: 'loy-004', customer_uuid: 'usr-004', provider_uuid: 'prov-001', points_balance: 240, tier: null, updated_at: '2026-05-26T09:00:00Z' },
        customerName: 'Khaled Samir', providerName: 'Glamour Studio',
    },
    {
        account: { uuid: 'loy-005', customer_uuid: 'usr-005', provider_uuid: null, points_balance: 980, tier: 'Silver', updated_at: '2026-05-25T14:30:00Z' },
        customerName: 'Reem Adel', providerName: 'Platform-wide',
    },
];

export const mockLoyaltyTransactionRows: LoyaltyTransactionRow[] = [
    {
        txn: { uuid: 'ltx-001', loyalty_account_uuid: 'loy-001', type: 'earn', points: 120, visit_uuid: 'visit-1001', reason: 'Visit completed', created_at: '2026-05-29T13:20:00Z' },
        customerName: 'Fatima Al-Rashid',
    },
    {
        txn: { uuid: 'ltx-002', loyalty_account_uuid: 'loy-003', type: 'redeem', points: -500, visit_uuid: 'visit-1003', reason: 'Redeemed for discount', created_at: '2026-05-28T11:45:00Z' },
        customerName: 'Layla Mahmoud',
    },
    {
        txn: { uuid: 'ltx-003', loyalty_account_uuid: 'loy-002', type: 'earn', points: 60, visit_uuid: 'visit-1002', reason: 'Visit completed', created_at: '2026-05-29T16:05:00Z' },
        customerName: 'Mohamed Ahmed',
    },
    {
        txn: { uuid: 'ltx-004', loyalty_account_uuid: 'loy-005', type: 'expire', points: -80, visit_uuid: null, reason: 'Points expired', created_at: '2026-05-25T00:00:00Z' },
        customerName: 'Reem Adel',
    },
    {
        txn: { uuid: 'ltx-005', loyalty_account_uuid: 'loy-004', type: 'adjust', points: 240, visit_uuid: null, reason: 'Goodwill adjustment', created_at: '2026-05-26T09:00:00Z' },
        customerName: 'Khaled Samir',
    },
];

export const mockWaitlistRows: WaitlistReportRow[] = [
    {
        entry: { uuid: 'wl-001', provider_uuid: 'prov-001', branch_uuid: 'br-001', customer_uuid: 'usr-006', service_uuid: 'svc-002', status: 'waiting', requested_date: '2026-06-02', position: 1, created_at: '2026-05-29T08:00:00Z', updated_at: '2026-05-29T08:00:00Z' },
        customerName: 'Sara Ibrahim', providerName: 'Glamour Studio', serviceName: 'Hair Coloring - Full',
    },
    {
        entry: { uuid: 'wl-002', provider_uuid: 'prov-001', branch_uuid: 'br-001', customer_uuid: 'usr-007', service_uuid: 'svc-002', status: 'waiting', requested_date: '2026-06-02', position: 2, created_at: '2026-05-29T09:15:00Z', updated_at: '2026-05-29T09:15:00Z' },
        customerName: 'Nour El-Din', providerName: 'Glamour Studio', serviceName: 'Hair Coloring - Full',
    },
    {
        entry: { uuid: 'wl-003', provider_uuid: 'prov-004', branch_uuid: 'br-004', customer_uuid: 'usr-008', service_uuid: 'svc-014', status: 'notified', requested_date: '2026-06-01', position: 1, created_at: '2026-05-28T17:40:00Z', updated_at: '2026-05-29T10:00:00Z' },
        customerName: 'Tarek Mansour', providerName: 'Royal Spa & Wellness', serviceName: 'Swedish Massage',
    },
    {
        entry: { uuid: 'wl-004', provider_uuid: 'prov-002', branch_uuid: 'br-002', customer_uuid: 'usr-009', service_uuid: null, status: 'booked', requested_date: '2026-05-30', position: null, created_at: '2026-05-27T12:00:00Z', updated_at: '2026-05-29T11:30:00Z' },
        customerName: 'Mona Rashid', providerName: 'Elite Barbers', serviceName: null,
    },
    {
        entry: { uuid: 'wl-005', provider_uuid: 'prov-004', branch_uuid: 'br-004', customer_uuid: 'usr-010', service_uuid: 'svc-014', status: 'cancelled', requested_date: '2026-05-29', position: null, created_at: '2026-05-26T15:20:00Z', updated_at: '2026-05-28T08:45:00Z' },
        customerName: 'Amr Hassan', providerName: 'Royal Spa & Wellness', serviceName: 'Swedish Massage',
    },
];
