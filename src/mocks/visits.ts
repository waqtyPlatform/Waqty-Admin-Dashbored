/**
 * Canonical mock Visits (SA-3 input).
 *
 * The platform money layer (commission ledger, payouts, revenue summary) is
 * DERIVED from these paid/partial Visits via contract/platform_finance.ts —
 * nothing is hand-aggregated. All money is integer MINOR UNITS (piastres);
 * 100 = EGP 1.00.
 */
import type { Visit, Payment, VisitLineItem, PaymentStatus, BookingStatus } from '@/contract/waqty_contract';
import { toMinor, activeCurrency } from '@/lib/market';

let _n = 0;
const id = (p: string) => `${p}-${(++_n).toString().padStart(4, '0')}`;

interface VisitSeed {
    provider: string;          // provider_uuid
    customer: string;          // customer_uuid
    grossMajor: number;        // visit total in MAJOR units (EGP)
    feeMajor: number;          // user transaction fee in MAJOR units
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paidAt: string | null;     // ISO; null while unpaid
    createdAt: string;
}

function mkVisit(s: VisitSeed): Visit {
    const visitUuid = id('visit');
    const total = toMinor(s.grossMajor);
    const fee = toMinor(s.feeMajor);
    const paid =
        s.paymentStatus === 'paid' ? total :
        s.paymentStatus === 'partial' ? Math.round(total / 2) : 0;

    const lineItem: VisitLineItem = {
        uuid: id('line'),
        visit_uuid: visitUuid,
        service_uuid: id('svc'),
        employee_uuid: null,
        start_time: s.createdAt,
        duration_minutes: 60,
        price: total,
        status: s.status,
    };

    const payment: Payment = {
        uuid: id('pay'),
        visit_uuid: visitUuid,
        model: 'online_upfront',
        method: 'card',
        status: s.paymentStatus,
        total,
        paid_amount: paid,
        balance_amount: total - paid,
        currency: activeCurrency,
        platform_fee: fee,
        commission_amount: 0, // platform commission is derived in platform_finance
        paid_at: s.paidAt,
        created_at: s.createdAt,
        updated_at: s.paidAt ?? s.createdAt,
    };

    return {
        uuid: visitUuid,
        provider_uuid: s.provider,
        branch_uuid: id('branch'),
        customer_uuid: s.customer,
        status: s.status,
        scheduled_start: s.createdAt,
        scheduled_end: null,
        line_items: [lineItem],
        payment,
        subtotal: total,
        discount_total: 0,
        tip_total: 0,
        total,
        currency: activeCurrency,
        notes: null,
        created_at: s.createdAt,
        updated_at: s.paidAt ?? s.createdAt,
        completed_at: s.status === 'completed' ? s.paidAt : null,
    };
}

export const mockVisits: Visit[] = [
    // April 2026 — billed
    mkVisit({ provider: 'prov-001', customer: 'cus-001', grossMajor: 350, feeMajor: 7, status: 'completed', paymentStatus: 'paid',    paidAt: '2026-04-13T10:00:00Z', createdAt: '2026-04-13T09:00:00Z' }),
    mkVisit({ provider: 'prov-002', customer: 'cus-002', grossMajor: 150, feeMajor: 3, status: 'completed', paymentStatus: 'paid',    paidAt: '2026-04-13T09:30:00Z', createdAt: '2026-04-13T08:30:00Z' }),
    mkVisit({ provider: 'prov-003', customer: 'cus-003', grossMajor: 500, feeMajor: 10, status: 'completed', paymentStatus: 'partial', paidAt: '2026-04-12T16:00:00Z', createdAt: '2026-04-12T15:00:00Z' }),
    mkVisit({ provider: 'prov-004', customer: 'cus-004', grossMajor: 280, feeMajor: 6, status: 'completed', paymentStatus: 'paid',    paidAt: '2026-04-12T14:00:00Z', createdAt: '2026-04-12T13:00:00Z' }),
    mkVisit({ provider: 'prov-005', customer: 'cus-005', grossMajor: 80,  feeMajor: 2, status: 'completed', paymentStatus: 'paid',    paidAt: '2026-04-12T11:00:00Z', createdAt: '2026-04-12T10:00:00Z' }),
    mkVisit({ provider: 'prov-001', customer: 'cus-006', grossMajor: 420, feeMajor: 8, status: 'completed', paymentStatus: 'paid',    paidAt: '2026-04-11T15:00:00Z', createdAt: '2026-04-11T14:00:00Z' }),
    mkVisit({ provider: 'prov-009', customer: 'cus-007', grossMajor: 600, feeMajor: 12, status: 'in_progress', paymentStatus: 'partial', paidAt: '2026-04-11T10:00:00Z', createdAt: '2026-04-11T09:30:00Z' }),
    // not billed yet — must NOT contribute to revenue
    mkVisit({ provider: 'prov-011', customer: 'cus-008', grossMajor: 120, feeMajor: 3, status: 'pending',  paymentStatus: 'pending', paidAt: null, createdAt: '2026-04-10T16:00:00Z' }),
    mkVisit({ provider: 'prov-002', customer: 'cus-009', grossMajor: 200, feeMajor: 4, status: 'cancelled', paymentStatus: 'failed', paidAt: null, createdAt: '2026-04-09T12:00:00Z' }),
    // March 2026 — prior period (drives a second payout bucket)
    mkVisit({ provider: 'prov-001', customer: 'cus-010', grossMajor: 900, feeMajor: 18, status: 'completed', paymentStatus: 'paid',   paidAt: '2026-03-20T12:00:00Z', createdAt: '2026-03-20T11:00:00Z' }),
    mkVisit({ provider: 'prov-004', customer: 'cus-011', grossMajor: 450, feeMajor: 9, status: 'completed', paymentStatus: 'paid',    paidAt: '2026-03-18T14:00:00Z', createdAt: '2026-03-18T13:00:00Z' }),
];
