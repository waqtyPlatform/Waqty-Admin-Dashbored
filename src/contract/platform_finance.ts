/**
 * ============================================================================
 *  WAQTY / HAGZY — PLATFORM FINANCE  (mock derivation over the canonical contract)
 * ----------------------------------------------------------------------------
 *  Pure functions that turn paid Visits into the platform's money layer:
 *  per-booking commission, the user transaction fee, and the provider
 *  payout/settlement that nets them. This makes 3 of the 4 revenue streams
 *  demonstrable end-to-end (subscriptions + ads/featured are billed separately).
 *
 *  No I/O — feed it the Visits your mock/HTTP repository already returns.
 *  All money is integer MINOR UNITS (piastres); 100 = EGP 1.00.
 * ============================================================================
 */
import {
  Visit,
  PlatformCommission,
  Payout,
  TransactionFee,
  Provider,
  Money,
  Uuid,
  CurrencyCode,
  IsoDate,
  EGYPT_MARKET,
} from "./waqty_contract";

let _seq = 0;
const _uid = (p: string): Uuid => `${p}_${Date.now()}_${_seq++}`;
const _period = (iso: string): string => iso.slice(0, 7); // "YYYY-MM"
const _round = (n: number): Money => Math.round(n);

// Last calendar day of a "YYYY-MM" period as an IsoDate ("2026-02" -> "2026-02-28").
const _monthEnd = (period: string): IsoDate => {
  const [y, m] = period.split("-").map(Number);
  const day = new Date(Date.UTC(y, m, 0)).getUTCDate(); // day 0 of next month = last of this
  return `${period}-${String(day).padStart(2, "0")}`;
};

/** A visit contributes to platform revenue once its payment is paid or partial. */
export function isBilled(visit: Visit): boolean {
  return visit.payment.status === "paid" || visit.payment.status === "partial";
}

/** Per-booking platform-commission ledger entry derived from a visit. */
export function commissionForVisit(
  visit: Visit,
  commissionRate: number,
): PlatformCommission {
  // gross intentionally includes tips (visit.total = subtotal - discount + tip):
  // platform commission applies to the full transaction by product decision.
  const gross: Money = visit.total;
  const commission: Money = _round(gross * commissionRate);
  const fee: Money = visit.payment.platform_fee;
  return {
    uuid: _uid("pcom"),
    provider_uuid: visit.provider_uuid,
    visit_uuid: visit.uuid,
    gross_amount: gross,
    commission_rate: commissionRate,
    commission_amount: commission,
    provider_net: gross - commission - fee,
    currency: visit.currency,
    period: _period(visit.payment.paid_at ?? visit.created_at),
    created_at: new Date().toISOString(),
  };
}

/** The user transaction fee captured on a visit's payment. */
export function transactionFeeForVisit(visit: Visit): TransactionFee {
  return {
    uuid: _uid("txf"),
    visit_uuid: visit.uuid,
    payment_uuid: visit.payment.uuid ?? visit.uuid,
    amount: visit.payment.platform_fee,
    currency: visit.currency,
    created_at: new Date().toISOString(),
  };
}

/** Build one Payout per provider per period from billed visits. */
export function buildPayouts(
  visits: Visit[],
  commissionRateByProvider: Record<Uuid, number>,
): Payout[] {
  interface Bucket {
    provider: Uuid;
    period: string;
    gross: Money;
    commission: Money;
    fees: Money;
    currency: CurrencyCode;
  }
  const groups = new Map<string, Bucket>();
  for (const v of visits) {
    if (!isBilled(v)) continue;
    const rate = commissionRateByProvider[v.provider_uuid] ?? 0;
    const period = _period(v.payment.paid_at ?? v.created_at);
    const key = `${v.provider_uuid}|${period}`;
    const g: Bucket =
      groups.get(key) ??
      { provider: v.provider_uuid, period, gross: 0, commission: 0, fees: 0, currency: v.currency };
    g.gross += v.total;
    g.commission += _round(v.total * rate);
    g.fees += v.payment.platform_fee;
    groups.set(key, g);
  }
  const payouts: Payout[] = [];
  for (const g of groups.values()) {
    payouts.push({
      uuid: _uid("payout"),
      provider_uuid: g.provider,
      period_start: `${g.period}-01`,
      period_end: _monthEnd(g.period),
      gross: g.gross,
      commission_total: g.commission,
      fees_total: g.fees,
      net_payable: g.gross - g.commission - g.fees,
      currency: g.currency,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  }
  return payouts;
}

/** Platform-side roll-up across billed visits. */
export interface PlatformRevenueSummary {
  billed_visits: number;
  gross_bookings: Money;
  commission_total: Money;
  transaction_fees_total: Money;
  platform_revenue: Money; // commission + transaction fees
  provider_net_total: Money;
  currency: CurrencyCode;
}

export function platformRevenueSummary(
  visits: Visit[],
  commissionRateByProvider: Record<Uuid, number>,
): PlatformRevenueSummary {
  let billed = 0;
  let gross = 0;
  let commission = 0;
  let fees = 0;
  let currency: CurrencyCode = EGYPT_MARKET.currency;
  for (const v of visits) {
    if (!isBilled(v)) continue;
    billed += 1;
    currency = v.currency; // billed visits share the active market's currency
    const rate = commissionRateByProvider[v.provider_uuid] ?? 0;
    gross += v.total;
    commission += _round(v.total * rate);
    fees += v.payment.platform_fee;
  }
  return {
    billed_visits: billed,
    gross_bookings: gross,
    commission_total: commission,
    transaction_fees_total: fees,
    platform_revenue: commission + fees,
    provider_net_total: gross - commission - fees,
    currency,
  };
}

/** Convenience: a provider_uuid -> commission_rate map from Provider records. */
export function ratesByProvider(providers: Provider[]): Record<Uuid, number> {
  const map: Record<Uuid, number> = {};
  for (const p of providers) map[p.uuid] = p.commission_rate;
  return map;
}
