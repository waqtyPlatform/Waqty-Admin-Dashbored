/**
 * Market configuration + money formatting (SA-6 / G5).
 *
 * The market REGISTRY (EGYPT_MARKET / MARKETS) and the money SCALE primitives now
 * live in the canonical contract — ONE source of truth, shared by every app. This
 * module re-exports them and owns only SuperAdmin's RENDER style (prefix
 * "EGP 299.00", compact "EGP 340K", ar-EG/en-EG). All money in the contract is
 * integer MINOR UNITS (piastres); 100 = EGP 1.00.
 */
import {
    EGYPT_MARKET,
    MARKETS,
    toMinorUnits,
    toMajorUnits,
    vatAmount as vatAmountContract,
    minorFractionDigits,
} from '@/contract/waqty_contract';
import type { MarketConfig, Money, CurrencyCode, LocaleCode } from '@/contract/waqty_contract';

// Re-export the canonical registry so existing `@/lib/market` imports keep working.
export { EGYPT_MARKET, MARKETS };

/**
 * The active market. Single switch point — read from env so non-EG deployments
 * are config, not code. Defaults to Egypt.
 */
export const activeMarket: MarketConfig =
    MARKETS[process.env.NEXT_PUBLIC_MARKET ?? 'EG'] ?? EGYPT_MARKET;

/**
 * Render an integer MINOR-UNIT amount as a localized currency string.
 * `formatMoney(29900)` -> "EGP 299.00" for the Egypt market.
 */
export function formatMoney(
    minorUnits: Money,
    opts?: { market?: MarketConfig; locale?: LocaleCode; withCurrency?: boolean },
): string {
    const market = opts?.market ?? activeMarket;
    const digits = minorFractionDigits(market);
    const major = toMajorUnits(minorUnits, market);
    const number = new Intl.NumberFormat(opts?.locale === 'ar' ? 'ar-EG' : 'en-EG', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(major);
    return opts?.withCurrency === false ? number : `${market.currency} ${number}`;
}

/**
 * Render an integer MINOR-UNIT amount as an ABBREVIATED currency string for
 * dense surfaces (chart axes, tooltips, KPI cards): `formatCompactMoney(34000000)`
 * -> "EGP 340K", `formatCompactMoney(296300000)` -> "EGP 3.0M". The currency comes
 * from the active market (no hardcoded "EGP"); pass `withCurrency: false` for bare
 * axis ticks ("340K").
 */
export function formatCompactMoney(
    minorUnits: Money,
    opts?: { market?: MarketConfig; withCurrency?: boolean },
): string {
    const market = opts?.market ?? activeMarket;
    const major = toMajorUnits(minorUnits, market);
    const abs = Math.abs(major);
    const n =
        abs >= 1_000_000 ? `${(major / 1_000_000).toFixed(1)}M`
        : abs >= 1_000 ? `${Math.round(major / 1_000)}K`
        : `${Math.round(major)}`;
    return opts?.withCurrency === false ? n : `${market.currency} ${n}`;
}

/** Convert major units (e.g. EGP 299) to canonical minor units (29900). */
export function toMinor(major: number, market: MarketConfig = activeMarket): Money {
    return toMinorUnits(major, market);
}

/** Convert canonical minor units (29900) back to major units (299) for form inputs. */
export function toMajor(minor: Money, market: MarketConfig = activeMarket): number {
    return toMajorUnits(minor, market);
}

/** VAT for the active market, on a minor-unit base. */
export function vatAmount(baseMinor: Money, market: MarketConfig = activeMarket): Money {
    return vatAmountContract(baseMinor, market);
}

/** Helper for the active currency code (config-driven). */
export const activeCurrency: CurrencyCode = activeMarket.currency;
