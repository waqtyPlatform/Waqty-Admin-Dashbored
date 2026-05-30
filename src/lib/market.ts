/**
 * Market configuration + money formatting (SA-6).
 *
 * All money in the canonical contract is integer MINOR UNITS (piastres);
 * 100 = EGP 1.00. The active market drives currency, VAT and minor-unit scale,
 * so amounts render correctly when GCC markets drop in later — nothing is
 * hardcoded at the call site beyond `formatMoney(minorUnits)`.
 */
import type { MarketConfig, Money, CurrencyCode, LocaleCode } from '@/contract/waqty_contract';

/** Egypt is the launch default. Add more markets here; GCC drops in via config. */
export const EGYPT_MARKET: MarketConfig = {
    country: 'EG',
    currency: 'EGP',
    default_locale: 'ar',
    dialing_code: '+20',
    minor_units_per_major: 100,
    vat_rate: 0.14,
};

export const MARKETS: Record<string, MarketConfig> = {
    EG: EGYPT_MARKET,
    // SA: { country: 'SA', currency: 'SAR', default_locale: 'ar', dialing_code: '+966', minor_units_per_major: 100, vat_rate: 0.15 },
    // AE: { country: 'AE', currency: 'AED', default_locale: 'ar', dialing_code: '+971', minor_units_per_major: 100, vat_rate: 0.05 },
};

/**
 * The active market. Single switch point — read from env so non-EG deployments
 * are config, not code. Defaults to Egypt.
 */
export const activeMarket: MarketConfig =
    MARKETS[process.env.NEXT_PUBLIC_MARKET ?? 'EG'] ?? EGYPT_MARKET;

const minorDigits = (m: MarketConfig): number =>
    Math.max(0, Math.round(Math.log10(m.minor_units_per_major)));

/**
 * Render an integer MINOR-UNIT amount as a localized currency string.
 * `formatMoney(29900)` -> "EGP 299.00" for the Egypt market.
 */
export function formatMoney(
    minorUnits: Money,
    opts?: { market?: MarketConfig; locale?: LocaleCode; withCurrency?: boolean },
): string {
    const market = opts?.market ?? activeMarket;
    const digits = minorDigits(market);
    const major = minorUnits / market.minor_units_per_major;
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
    const major = minorUnits / market.minor_units_per_major;
    const abs = Math.abs(major);
    const n =
        abs >= 1_000_000 ? `${(major / 1_000_000).toFixed(1)}M`
        : abs >= 1_000 ? `${Math.round(major / 1_000)}K`
        : `${Math.round(major)}`;
    return opts?.withCurrency === false ? n : `${market.currency} ${n}`;
}

/** Convert major units (e.g. EGP 299) to canonical minor units (29900). */
export function toMinor(major: number, market: MarketConfig = activeMarket): Money {
    return Math.round(major * market.minor_units_per_major);
}

/** Convert canonical minor units (29900) back to major units (299) for form inputs. */
export function toMajor(minor: Money, market: MarketConfig = activeMarket): number {
    return minor / market.minor_units_per_major;
}

/** VAT for the active market, on a minor-unit base. */
export function vatAmount(baseMinor: Money, market: MarketConfig = activeMarket): Money {
    return Math.round(baseMinor * market.vat_rate);
}

/** Helper for the active currency code (config-driven). */
export const activeCurrency: CurrencyCode = activeMarket.currency;
