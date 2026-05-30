import type { SubscriptionPlanRow, ProviderSubscriptionRow } from '@/types/subscription';

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
export const mockSubscriptions: ProviderSubscriptionRow[] = [
    { uuid: 'sub-1', provider_uuid: 'prov-001', provider_name: 'Glamour Studio', plan_uuid: 'plan-3', plan_name: 'Enterprise', plan_tier: 'enterprise', billing_cycle: 'yearly', status: 'active', current_period_start: '2026-01-01T00:00:00Z', current_period_end: '2026-12-31T23:59:59Z', trial_end: null, amount: 1299000, currency: 'EGP', payment_method: 'Credit Card', auto_renew: true, created_at: '2023-06-15T10:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    { uuid: 'sub-2', provider_uuid: 'prov-002', provider_name: 'Elite Barbers', plan_uuid: 'plan-3', plan_name: 'Enterprise', plan_tier: 'enterprise', billing_cycle: 'monthly', status: 'active', current_period_start: '2026-04-01T00:00:00Z', current_period_end: '2026-04-30T23:59:59Z', trial_end: null, amount: 129900, currency: 'EGP', payment_method: 'Bank Transfer', auto_renew: true, created_at: '2023-08-20T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-3', provider_uuid: 'prov-004', provider_name: 'Royal Spa & Wellness', plan_uuid: 'plan-2', plan_name: 'Pro', plan_tier: 'pro', billing_cycle: 'monthly', status: 'active', current_period_start: '2026-04-01T00:00:00Z', current_period_end: '2026-04-30T23:59:59Z', trial_end: null, amount: 59900, currency: 'EGP', payment_method: 'Credit Card', auto_renew: true, created_at: '2024-01-10T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-4', provider_uuid: 'prov-006', provider_name: 'Nail Art Studio', plan_uuid: 'plan-1', plan_name: 'Basic', plan_tier: 'basic', billing_cycle: 'monthly', status: 'past_due', current_period_start: '2026-03-01T00:00:00Z', current_period_end: '2026-03-31T23:59:59Z', trial_end: null, amount: 29900, currency: 'EGP', payment_method: 'Credit Card', auto_renew: true, created_at: '2024-05-20T10:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
    { uuid: 'sub-5', provider_uuid: 'prov-008', provider_name: 'Hair Corner', plan_uuid: 'plan-1', plan_name: 'Basic', plan_tier: 'basic', billing_cycle: 'monthly', status: 'trial', current_period_start: '2026-03-25T00:00:00Z', current_period_end: '2026-04-08T23:59:59Z', trial_end: '2026-04-08T23:59:59Z', amount: 0, currency: 'EGP', payment_method: '', auto_renew: false, created_at: '2026-03-25T10:00:00Z', updated_at: '2026-03-25T10:00:00Z' },
    { uuid: 'sub-6', provider_uuid: 'prov-005', provider_name: 'Fresh Cuts Downtown', plan_uuid: 'plan-2', plan_name: 'Pro', plan_tier: 'pro', billing_cycle: 'yearly', status: 'active', current_period_start: '2026-03-05T00:00:00Z', current_period_end: '2027-03-04T23:59:59Z', trial_end: null, amount: 599000, currency: 'EGP', payment_method: 'PayPal', auto_renew: true, created_at: '2024-03-05T10:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
    { uuid: 'sub-7', provider_uuid: 'prov-007', provider_name: 'The Gentleman Club', plan_uuid: 'plan-1', plan_name: 'Basic', plan_tier: 'basic', billing_cycle: 'monthly', status: 'cancelled', current_period_start: '2026-02-01T00:00:00Z', current_period_end: '2026-02-28T23:59:59Z', trial_end: null, amount: 29900, currency: 'EGP', payment_method: 'Credit Card', auto_renew: false, created_at: '2024-07-15T10:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
];
