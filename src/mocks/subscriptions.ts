import type { SubscriptionPlanRow, ProviderSubscriptionRow, CommissionPlanRow } from '@/types/subscription';

// Plan prices are canonical Money — integer MINOR UNITS (100 = EGP 1.00).
export const mockPlans: SubscriptionPlanRow[] = [
    {
        uuid: 'plan-1', name: 'Basic', name_ar: 'الأساسية', tier: 'basic',
        price_monthly: 29900, price_yearly: 299000, currency: 'EGP',
        features: [
            { key: 'online_booking', label: 'Online Booking', label_ar: 'الحجز أونلاين', included: true },
            { key: 'basic_reports', label: 'Basic Reports', label_ar: 'تقارير أساسية', included: true },
            { key: 'sms_reminders', label: 'SMS Reminders', label_ar: 'تذكير SMS', included: true },
            { key: 'advanced_reports', label: 'Advanced Reports', label_ar: 'تقارير متقدمة', included: false },
            { key: 'api_access', label: 'API Access', label_ar: 'الوصول للـAPI', included: false },
        ],
        limits: { max_branches: 1, max_employees: 5, max_services: 20, max_bookings_per_month: 200, storage_gb: 1 },
        active: true, trial_days: 14, providers_count: 412, created_at: '2023-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        uuid: 'plan-2', name: 'Pro', name_ar: 'الاحترافية', tier: 'pro',
        price_monthly: 59900, price_yearly: 599000, currency: 'EGP',
        features: [
            { key: 'online_booking', label: 'Online Booking', label_ar: 'الحجز أونلاين', included: true },
            { key: 'basic_reports', label: 'Basic Reports', label_ar: 'تقارير أساسية', included: true },
            { key: 'sms_reminders', label: 'SMS Reminders', label_ar: 'تذكير SMS', included: true },
            { key: 'advanced_reports', label: 'Advanced Reports', label_ar: 'تقارير متقدمة', included: true },
            { key: 'api_access', label: 'API Access', label_ar: 'الوصول للـAPI', included: false },
        ],
        limits: { max_branches: 3, max_employees: 20, max_services: 100, max_bookings_per_month: 1000, storage_gb: 5 },
        active: true, trial_days: 14, providers_count: 328, created_at: '2023-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        uuid: 'plan-3', name: 'Enterprise', name_ar: 'المؤسسات', tier: 'enterprise',
        price_monthly: 129900, price_yearly: 1299000, currency: 'EGP',
        features: [
            { key: 'online_booking', label: 'Online Booking', label_ar: 'الحجز أونلاين', included: true },
            { key: 'basic_reports', label: 'Basic Reports', label_ar: 'تقارير أساسية', included: true },
            { key: 'sms_reminders', label: 'SMS Reminders', label_ar: 'تذكير SMS', included: true },
            { key: 'advanced_reports', label: 'Advanced Reports', label_ar: 'تقارير متقدمة', included: true },
            { key: 'api_access', label: 'API Access', label_ar: 'الوصول للـAPI', included: true },
        ],
        limits: { max_branches: -1, max_employees: -1, max_services: -1, max_bookings_per_month: -1, storage_gb: 50 },
        active: true, trial_days: 30, providers_count: 152, created_at: '2023-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
];

// Subscription amounts are canonical Money — integer MINOR UNITS.
// billing_type distinguishes flat 'subscription' plans from 'commission' accounts
// (platform takes commission_rate % of revenue instead of a flat fee).
export const mockSubscriptions: ProviderSubscriptionRow[] = [
    { uuid: 'sub-1', provider_uuid: 'prov-001', provider_name: 'Glamour Studio', plan_uuid: 'plan-3', plan_name: 'Enterprise', plan_tier: 'enterprise', billing_cycle: 'yearly', status: 'active', current_period_start: '2026-01-01T00:00:00Z', current_period_end: '2026-12-31T23:59:59Z', trial_end: null, amount: 1299000, currency: 'EGP', payment_method: 'Credit Card', auto_renew: true, billing_type: 'subscription', commission_rate: 0, created_at: '2023-06-15T10:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    { uuid: 'sub-2', provider_uuid: 'prov-002', provider_name: 'Elite Barbers', plan_uuid: 'plan-3', plan_name: 'Enterprise', plan_tier: 'enterprise', billing_cycle: 'monthly', status: 'active', current_period_start: '2026-04-01T00:00:00Z', current_period_end: '2026-04-30T23:59:59Z', trial_end: null, amount: 129900, currency: 'EGP', payment_method: 'Bank Transfer', auto_renew: true, billing_type: 'subscription', commission_rate: 0, created_at: '2023-08-20T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-3', provider_uuid: 'prov-004', provider_name: 'Royal Spa & Wellness', plan_uuid: 'plan-2', plan_name: 'Pro', plan_tier: 'pro', billing_cycle: 'monthly', status: 'active', current_period_start: '2026-04-01T00:00:00Z', current_period_end: '2026-04-30T23:59:59Z', trial_end: null, amount: 59900, currency: 'EGP', payment_method: 'Credit Card', auto_renew: true, billing_type: 'subscription', commission_rate: 0, created_at: '2024-01-10T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-4', provider_uuid: 'prov-006', provider_name: 'Nail Art Studio', plan_uuid: 'plan-1', plan_name: 'Basic', plan_tier: 'basic', billing_cycle: 'monthly', status: 'past_due', current_period_start: '2026-03-01T00:00:00Z', current_period_end: '2026-03-31T23:59:59Z', trial_end: null, amount: 29900, currency: 'EGP', payment_method: 'Credit Card', auto_renew: true, billing_type: 'subscription', commission_rate: 0, created_at: '2024-05-20T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-5', provider_uuid: 'prov-008', provider_name: 'Hair Corner', plan_uuid: 'plan-1', plan_name: 'Basic', plan_tier: 'basic', billing_cycle: 'monthly', status: 'trial', current_period_start: '2026-03-25T00:00:00Z', current_period_end: '2026-04-08T23:59:59Z', trial_end: '2026-04-08T23:59:59Z', amount: 0, currency: 'EGP', payment_method: '', auto_renew: false, billing_type: 'subscription', commission_rate: 0, created_at: '2026-03-25T10:00:00Z', updated_at: '2026-03-25T10:00:00Z' },
    { uuid: 'sub-6', provider_uuid: 'prov-005', provider_name: 'Fresh Cuts Downtown', plan_uuid: 'plan-2', plan_name: 'Pro', plan_tier: 'pro', billing_cycle: 'yearly', status: 'active', current_period_start: '2026-03-05T00:00:00Z', current_period_end: '2027-03-04T23:59:59Z', trial_end: null, amount: 599000, currency: 'EGP', payment_method: 'PayPal', auto_renew: true, billing_type: 'subscription', commission_rate: 0, created_at: '2024-03-05T10:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
    { uuid: 'sub-7', provider_uuid: 'prov-007', provider_name: 'The Gentleman Club', plan_uuid: 'plan-1', plan_name: 'Basic', plan_tier: 'basic', billing_cycle: 'monthly', status: 'cancelled', current_period_start: '2026-02-01T00:00:00Z', current_period_end: '2026-02-28T23:59:59Z', trial_end: null, amount: 29900, currency: 'EGP', payment_method: 'Credit Card', auto_renew: false, billing_type: 'subscription', commission_rate: 0, created_at: '2024-07-15T10:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
    // ── Commission-billed providers (no flat fee; platform takes commission_rate % of revenue) ──
    // plan_uuid / plan_name reference a reusable Commission Plan (see mockCommissionPlans).
    { uuid: 'sub-8', provider_uuid: 'prov-003', provider_name: 'Beauty Clinic Cairo', plan_uuid: 'comm-2', plan_name: 'Standard Commission', plan_tier: 'pro', billing_cycle: 'monthly', status: 'active', current_period_start: '2026-04-01T00:00:00Z', current_period_end: '2026-04-30T23:59:59Z', trial_end: null, amount: 0, currency: 'EGP', payment_method: 'Auto-deducted', auto_renew: true, billing_type: 'commission', commission_rate: 0.12, created_at: '2024-02-10T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-9', provider_uuid: 'prov-010', provider_name: 'Classic Cuts', plan_uuid: 'comm-1', plan_name: 'Starter Commission', plan_tier: 'basic', billing_cycle: 'monthly', status: 'active', current_period_start: '2026-04-01T00:00:00Z', current_period_end: '2026-04-30T23:59:59Z', trial_end: null, amount: 0, currency: 'EGP', payment_method: 'Auto-deducted', auto_renew: true, billing_type: 'commission', commission_rate: 0.15, created_at: '2024-09-01T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-10', provider_uuid: 'prov-012', provider_name: 'Zen Barber Lounge', plan_uuid: 'comm-3', plan_name: 'Premium Commission', plan_tier: 'basic', billing_cycle: 'monthly', status: 'past_due', current_period_start: '2026-03-01T00:00:00Z', current_period_end: '2026-03-31T23:59:59Z', trial_end: null, amount: 0, currency: 'EGP', payment_method: 'Auto-deducted', auto_renew: true, billing_type: 'commission', commission_rate: 0.10, created_at: '2025-01-15T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
];

// Commission plans — reusable named commission rates the admin defines once and
// assigns to commission-billed providers (the commission-billing parallel to
// mockPlans). min_monthly_fee is canonical Money — integer MINOR UNITS.
export const mockCommissionPlans: CommissionPlanRow[] = [
    {
        uuid: 'comm-1', name: 'Starter Commission', name_ar: 'عمولة المبتدئ',
        commission_rate: 0.15, settlement_cycle: 'monthly', min_monthly_fee: 0,
        features: ['No monthly fee', 'Pay only when you earn', 'Standard support'],
        features_ar: ['بدون رسوم شهرية', 'تدفع فقط عند تحقيق دخل', 'دعم قياسي'],
        active: true, providers_count: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        uuid: 'comm-2', name: 'Standard Commission', name_ar: 'عمولة قياسية',
        commission_rate: 0.12, settlement_cycle: 'monthly', min_monthly_fee: 0,
        features: ['No monthly fee', 'Lower rate than Starter', 'Priority support', 'Monthly settlement'],
        features_ar: ['بدون رسوم شهرية', 'نسبة أقل من المبتدئ', 'دعم ذو أولوية', 'تسوية شهرية'],
        active: true, providers_count: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        uuid: 'comm-3', name: 'Premium Commission', name_ar: 'عمولة بريميَم',
        commission_rate: 0.10, settlement_cycle: 'monthly', min_monthly_fee: 50000,
        features: ['Lowest commission rate', 'Dedicated account manager', 'Weekly payouts', 'Min. monthly fee applies'],
        features_ar: ['أقل نسبة عمولة', 'مدير حساب مخصص', 'تحويلات أسبوعية', 'يطبَّق حد أدنى شهري'],
        active: true, providers_count: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
];
