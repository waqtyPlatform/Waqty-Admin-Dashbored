/**
 * Mock-mode analytics heuristics.
 *
 * These deterministic functions stand in for backend ML/analytics until
 * the real API lands. Each function has a 1:1 endpoint it will eventually
 * call; swap the internals when wiring a real backend.
 */

import type { Provider } from '@/types/provider';
import type { AuditLog } from '@/types/system';

// ─── Revenue forecasting (linear regression on monthly totals) ────────

export interface RevenuePoint {
    month: string;
    subscriptions?: number;
    commissions?: number;
    total: number;
    forecast?: boolean;
    lower?: number;
    upper?: number;
}

/** Simple least-squares linear regression over `totals`. Returns { slope, intercept, r2 }. */
export function linearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] ?? 0, r2: 0 };
    const xs = values.map((_, i) => i);
    const meanX = xs.reduce((a, b) => a + b) / n;
    const meanY = values.reduce((a, b) => a + b) / n;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - meanX) * (values[i] - meanY);
        denX += (xs[i] - meanX) ** 2;
        denY += (values[i] - meanY) ** 2;
    }
    const slope = denX === 0 ? 0 : num / denX;
    const intercept = meanY - slope * meanX;
    const r2 = denY === 0 ? 1 : (num ** 2) / (denX * denY);
    return { slope, intercept, r2 };
}

/** Extend a revenue series by `periods` months using linear regression + ±15% confidence band. */
export function forecastRevenue(history: RevenuePoint[], periods = 3): RevenuePoint[] {
    if (history.length < 3) return [];
    const totals = history.map(p => p.total);
    const { slope, intercept } = linearRegression(totals);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const lastMonthIdx = monthNames.indexOf(history[history.length - 1].month);
    const out: RevenuePoint[] = [];
    for (let i = 1; i <= periods; i++) {
        const projected = Math.max(0, Math.round(intercept + slope * (history.length - 1 + i)));
        const band = Math.round(projected * 0.15);
        out.push({
            month: monthNames[(lastMonthIdx + i) % 12],
            total: projected,
            lower: Math.max(0, projected - band),
            upper: projected + band,
            forecast: true,
        });
    }
    return out;
}

// ─── Anomaly detection on audit logs ──────────────────────────────────

export interface AnomalyFlag {
    severity: 'low' | 'medium' | 'high';
    reasons: string[];
}

/**
 * Rule-based anomaly scoring. Flags logs that show:
 *  - Burst: same admin >=5 actions within 10 minutes
 *  - Off-hours: created_at between 00:00–05:00 local time
 *  - High-risk action: block/soft_delete/settings.update
 *  - Rapid reversal: block → unblock of same entity within 30 min
 */
export function detectAnomalies(logs: AuditLog[]): Map<string, AnomalyFlag> {
    const flags = new Map<string, AnomalyFlag>();
    const byAdmin = new Map<string, AuditLog[]>();
    for (const log of logs) {
        const list = byAdmin.get(log.admin_id) ?? [];
        list.push(log);
        byAdmin.set(log.admin_id, list);
    }

    for (const log of logs) {
        const reasons: string[] = [];
        let severity: AnomalyFlag['severity'] = 'low';
        const ts = new Date(log.created_at).getTime();

        // Burst: 5+ actions from same admin within 10 minutes
        const sameAdmin = byAdmin.get(log.admin_id) ?? [];
        const nearby = sameAdmin.filter(l => Math.abs(new Date(l.created_at).getTime() - ts) <= 10 * 60 * 1000);
        if (nearby.length >= 5) {
            reasons.push(`Burst: ${nearby.length} actions in 10 minutes`);
            severity = 'high';
        }

        // Off-hours
        const hour = new Date(log.created_at).getUTCHours();
        if (hour >= 0 && hour < 5) {
            reasons.push('Off-hours access');
            if (severity === 'low') severity = 'medium';
        }

        // High-risk action
        const riskyActions = ['block', 'soft_delete', 'settings.update', 'commission.change'];
        if (riskyActions.some(a => log.action.includes(a))) {
            reasons.push(`High-risk action: ${log.action}`);
            if (severity === 'low') severity = 'medium';
        }

        // Rapid reversal
        if (log.action.endsWith('.unblock') || log.action.endsWith('.restore')) {
            const inverse = log.action.replace('.unblock', '.block').replace('.restore', '.soft_delete');
            const prior = sameAdmin.find(l => l.action === inverse && l.entity_id === log.entity_id && new Date(l.created_at).getTime() < ts && ts - new Date(l.created_at).getTime() < 30 * 60 * 1000);
            if (prior) {
                reasons.push('Rapid reversal of prior action');
                severity = 'high';
            }
        }

        if (reasons.length > 0) flags.set(log.id, { severity, reasons });
    }
    return flags;
}

// ─── Provider performance scoring ─────────────────────────────────────

export interface ProviderScore {
    score: number;
    tier: 'elite' | 'strong' | 'average' | 'at_risk';
    breakdown: {
        bookings: number;
        revenue: number;
        activity: number;
        subscription: number;
        tenure: number;
    };
}

/**
 * Composite 0–100 score. Weights:
 *   bookings (30) — relative to mock-wide p95
 *   revenue (25) — relative to mock-wide p95
 *   activity (20) — recency of last_active_at
 *   subscription (15) — active/trial=full, past_due=half, expired/cancelled=0
 *   tenure (10) — months since registered_at, capped at 36
 */
export function scoreProvider(p: Provider, allProviders: Provider[]): ProviderScore {
    const p95 = (key: 'total_bookings' | 'total_revenue') => {
        const sorted = allProviders.map(x => x[key]).sort((a, b) => a - b);
        const idx = Math.floor(sorted.length * 0.95);
        return Math.max(1, sorted[idx] ?? 1);
    };

    const bookings = Math.min(100, (p.total_bookings / p95('total_bookings')) * 100);
    const revenue = Math.min(100, (p.total_revenue / p95('total_revenue')) * 100);

    const daysSinceActive = (Date.now() - new Date(p.last_active_at).getTime()) / 86400000;
    const activity = Math.max(0, 100 - daysSinceActive * 4); // drops 4/day

    const subMap: Record<Provider['subscription_status'], number> = {
        active: 100, trial: 100, past_due: 50, expired: 0, cancelled: 0,
    };
    const subscription = subMap[p.subscription_status] ?? 0;

    const months = (Date.now() - new Date(p.registered_at).getTime()) / (86400000 * 30);
    const tenure = Math.min(100, (months / 36) * 100);

    const score = Math.round(
        bookings * 0.30 + revenue * 0.25 + activity * 0.20 + subscription * 0.15 + tenure * 0.10
    );

    let tier: ProviderScore['tier'] = 'average';
    if (score >= 80) tier = 'elite';
    else if (score >= 60) tier = 'strong';
    else if (score < 40) tier = 'at_risk';

    return {
        score,
        tier,
        breakdown: {
            bookings: Math.round(bookings),
            revenue: Math.round(revenue),
            activity: Math.round(activity),
            subscription,
            tenure: Math.round(tenure),
        },
    };
}

// ─── Churn-risk heuristic ─────────────────────────────────────────────

export interface ChurnRisk {
    risk: 'none' | 'watch' | 'high';
    reasons: string[];
    riskScore: number;
}

/**
 * Evaluate churn risk on a provider. Signals:
 *  - Inactive >14 days
 *  - Subscription past_due / expired
 *  - Booking momentum drop (mocked via last_active and status)
 *  - Performance score <40 (uses scoreProvider())
 */
export function assessChurnRisk(p: Provider, allProviders: Provider[]): ChurnRisk {
    const reasons: string[] = [];
    let riskScore = 0;

    const daysSinceActive = (Date.now() - new Date(p.last_active_at).getTime()) / 86400000;
    if (daysSinceActive > 30) {
        reasons.push(`Inactive ${Math.round(daysSinceActive)} days`);
        riskScore += 40;
    } else if (daysSinceActive > 14) {
        reasons.push(`Inactive ${Math.round(daysSinceActive)} days`);
        riskScore += 20;
    }

    if (p.subscription_status === 'past_due') {
        reasons.push('Subscription past due');
        riskScore += 30;
    } else if (p.subscription_status === 'expired' || p.subscription_status === 'cancelled') {
        reasons.push(`Subscription ${p.subscription_status}`);
        riskScore += 40;
    }

    if (p.total_bookings < 50 && p.status === 'active') {
        reasons.push('Low engagement: <50 bookings');
        riskScore += 15;
    }

    const { score } = scoreProvider(p, allProviders);
    if (score < 40) {
        reasons.push(`Performance score low (${score}/100)`);
        riskScore += 20;
    }

    let risk: ChurnRisk['risk'] = 'none';
    if (riskScore >= 60) risk = 'high';
    else if (riskScore >= 25) risk = 'watch';

    return { risk, reasons, riskScore: Math.min(100, riskScore) };
}

// ─── A/B test statistics ──────────────────────────────────────────────

export interface ABVariant {
    id: string;
    label: string;
    impressions: number;
    clicks: number;
    conversions: number;
}

export interface ABResult {
    ctrA: number;
    ctrB: number;
    convA: number;
    convB: number;
    lift: number;
    winner: 'A' | 'B' | 'tie' | 'inconclusive';
    confidence: number;
    sampleSize: number;
}

/**
 * Two-proportion z-test approximation for A/B conversion.
 * Returns confidence 0–100 and declares a winner when confidence ≥ 95%.
 */
export function compareVariants(a: ABVariant, b: ABVariant): ABResult {
    const ctrA = a.impressions ? a.clicks / a.impressions : 0;
    const ctrB = b.impressions ? b.clicks / b.impressions : 0;
    const convA = a.impressions ? a.conversions / a.impressions : 0;
    const convB = b.impressions ? b.conversions / b.impressions : 0;
    const lift = convA === 0 ? 0 : ((convB - convA) / convA) * 100;

    const pooled = (a.conversions + b.conversions) / Math.max(1, a.impressions + b.impressions);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / Math.max(1, a.impressions) + 1 / Math.max(1, b.impressions)));
    const z = se === 0 ? 0 : Math.abs(convA - convB) / se;
    // Approximate 2-tailed confidence from z via erf (Abramowitz & Stegun 7.1.26)
    const erf = (x: number) => {
        const sign = Math.sign(x);
        const ax = Math.abs(x);
        const t = 1 / (1 + 0.3275911 * ax);
        const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
        return sign * y;
    };
    const confidence = Math.round(erf(z / Math.SQRT2) * 100);

    const sampleSize = a.impressions + b.impressions;
    let winner: ABResult['winner'] = 'inconclusive';
    if (sampleSize >= 1000 && confidence >= 95) {
        if (convA > convB) winner = 'A';
        else if (convB > convA) winner = 'B';
        else winner = 'tie';
    }

    return { ctrA, ctrB, convA, convB, lift, winner, confidence: Math.max(0, Math.min(100, confidence)), sampleSize };
}
