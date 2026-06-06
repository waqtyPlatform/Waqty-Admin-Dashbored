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
 * Localized currency LABEL per locale. The contract's `currency` is the ISO code
 * ("EGP"); under Arabic we show the native word "جنيه" instead. Falls back to the
 * ISO code for any locale/currency without an explicit label.
 */
const CURRENCY_LABELS: Record<string, Record<LocaleCode, string>> = {
    EGP: { en: 'EGP', ar: 'جنيه' },
};

/**
 * Ambient locale used by `formatMoney`/`formatCompactMoney` when the caller doesn't
 * pass an explicit `locale`. Synced from the UI language by `LanguageProvider` so
 * money follows the active language (e.g. shows "جنيه" instead of "EGP" in Arabic)
 * without threading a locale through every call site.
 */
let activeLocale: LocaleCode = 'en';

export function setMoneyLocale(locale: LocaleCode): void {
    activeLocale = locale;
}

function currencyLabel(market: MarketConfig, locale: LocaleCode): string {
    return CURRENCY_LABELS[market.currency]?.[locale] ?? market.currency;
}

/**
 * Render an integer MINOR-UNIT amount as a localized currency string.
 * `formatMoney(29900)` -> "EGP 299.00" (en) or "299.00 جنيه" (ar). The currency word
 * comes after the number in Arabic (natural order) and before it in English.
 */
export function formatMoney(
    minorUnits: Money,
    opts?: { market?: MarketConfig; locale?: LocaleCode; withCurrency?: boolean },
): string {
    const market = opts?.market ?? activeMarket;
    const locale = opts?.locale ?? activeLocale;
    const digits = minorFractionDigits(market);
    const major = toMajorUnits(minorUnits, market);
    const number = new Intl.NumberFormat('en-EG', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(major);
    if (opts?.withCurrency === false) return number;
    const label = currencyLabel(market, locale);
    return locale === 'ar' ? `${number} ${label}` : `${label} ${number}`;
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
    opts?: { market?: MarketConfig; locale?: LocaleCode; withCurrency?: boolean },
): string {
    const market = opts?.market ?? activeMarket;
    const locale = opts?.locale ?? activeLocale;
    const major = toMajorUnits(minorUnits, market);
    const abs = Math.abs(major);
    const n =
        abs >= 1_000_000 ? `${(major / 1_000_000).toFixed(1)}M`
        : abs >= 1_000 ? `${Math.round(major / 1_000)}K`
        : `${Math.round(major)}`;
    if (opts?.withCurrency === false) return n;
    const label = currencyLabel(market, locale);
    return locale === 'ar' ? `${n} ${label}` : `${label} ${n}`;
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
