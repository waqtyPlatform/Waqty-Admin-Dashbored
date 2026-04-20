import type { CommissionRecord, PayoutRecord } from '@/types/finance';

export const mockCommissions: CommissionRecord[] = [
    { id: 'com-1', provider_id: '1', provider_name: 'Glamour Studio', booking_id: 'BK-1001', booking_amount: 350, commission_rate: 10, commission_amount: 35, status: 'collected', created_at: '2026-04-13T10:00:00Z' },
    { id: 'com-2', provider_id: '2', provider_name: 'Elite Barbers', booking_id: 'BK-1002', booking_amount: 150, commission_rate: 10, commission_amount: 15, status: 'collected', created_at: '2026-04-13T09:30:00Z' },
    { id: 'com-3', provider_id: '3', provider_name: 'Beauty Clinic Cairo', booking_id: 'BK-1003', booking_amount: 500, commission_rate: 8, commission_amount: 40, status: 'pending', created_at: '2026-04-12T16:00:00Z' },
    { id: 'com-4', provider_id: '4', provider_name: 'Royal Spa & Wellness', booking_id: 'BK-1004', booking_amount: 280, commission_rate: 10, commission_amount: 28, status: 'collected', created_at: '2026-04-12T14:00:00Z' },
    { id: 'com-5', provider_id: '5', provider_name: 'Fresh Cuts Downtown', booking_id: 'BK-1005', booking_amount: 80, commission_rate: 10, commission_amount: 8, status: 'pending', created_at: '2026-04-12T11:00:00Z' },
    { id: 'com-6', provider_id: '1', provider_name: 'Glamour Studio', booking_id: 'BK-1006', booking_amount: 420, commission_rate: 10, commission_amount: 42, status: 'collected', created_at: '2026-04-11T15:00:00Z' },
    { id: 'com-7', provider_id: '9', provider_name: 'Glow Skin Clinic', booking_id: 'BK-1007', booking_amount: 600, commission_rate: 8, commission_amount: 48, status: 'pending', created_at: '2026-04-11T10:00:00Z' },
    { id: 'com-8', provider_id: '11', provider_name: 'Luxury Nails', booking_id: 'BK-1008', booking_amount: 120, commission_rate: 10, commission_amount: 12, status: 'waived', created_at: '2026-04-10T16:00:00Z' },
];

export const mockPayouts: PayoutRecord[] = [
    { id: 'pay-1', provider_id: '1', provider_name: 'Glamour Studio', amount: 45000, currency: 'EGP', method: 'bank_transfer', status: 'completed', period_start: '2026-03-01T00:00:00Z', period_end: '2026-03-31T23:59:59Z', created_at: '2026-04-05T10:00:00Z', completed_at: '2026-04-07T10:00:00Z' },
    { id: 'pay-2', provider_id: '2', provider_name: 'Elite Barbers', amount: 28000, currency: 'EGP', method: 'bank_transfer', status: 'completed', period_start: '2026-03-01T00:00:00Z', period_end: '2026-03-31T23:59:59Z', created_at: '2026-04-05T10:00:00Z', completed_at: '2026-04-07T14:00:00Z' },
    { id: 'pay-3', provider_id: '3', provider_name: 'Beauty Clinic Cairo', amount: 52000, currency: 'EGP', method: 'bank_transfer', status: 'processing', period_start: '2026-03-01T00:00:00Z', period_end: '2026-03-31T23:59:59Z', created_at: '2026-04-10T10:00:00Z', completed_at: null },
    { id: 'pay-4', provider_id: '4', provider_name: 'Royal Spa & Wellness', amount: 38000, currency: 'EGP', method: 'wallet', status: 'pending', period_start: '2026-03-01T00:00:00Z', period_end: '2026-03-31T23:59:59Z', created_at: '2026-04-12T10:00:00Z', completed_at: null },
    { id: 'pay-5', provider_id: '5', provider_name: 'Fresh Cuts Downtown', amount: 15000, currency: 'EGP', method: 'bank_transfer', status: 'completed', period_start: '2026-03-01T00:00:00Z', period_end: '2026-03-31T23:59:59Z', created_at: '2026-04-05T10:00:00Z', completed_at: '2026-04-06T10:00:00Z' },
];

export const monthlyRevenueData = [
    { month: 'Oct', subscriptions: 225000, commissions: 115000, total: 340000 },
    { month: 'Nov', subscriptions: 240000, commissions: 125000, total: 365000 },
    { month: 'Dec', subscriptions: 260000, commissions: 138000, total: 398000 },
    { month: 'Jan', subscriptions: 275000, commissions: 142000, total: 417000 },
    { month: 'Feb', subscriptions: 290000, commissions: 155000, total: 445000 },
    { month: 'Mar', subscriptions: 310000, commissions: 168000, total: 478000 },
    { month: 'Apr', subscriptions: 340000, commissions: 180000, total: 520000 },
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

export const geographicData = [
    { city: 'Cairo', providers: 520, users: 22000, bookings: 85000, revenue: 1200000 },
    { city: 'Alexandria', providers: 180, users: 8500, bookings: 28000, revenue: 380000 },
    { city: 'Giza', providers: 145, users: 6200, bookings: 19000, revenue: 260000 },
    { city: 'Mansoura', providers: 85, users: 3100, bookings: 8500, revenue: 115000 },
    { city: 'Tanta', providers: 62, users: 2400, bookings: 5800, revenue: 78000 },
    { city: 'Aswan', providers: 45, users: 1800, bookings: 4200, revenue: 56000 },
    { city: 'Luxor', providers: 38, users: 1500, bookings: 3500, revenue: 47000 },
    { city: 'Port Said', providers: 32, users: 1200, bookings: 2800, revenue: 38000 },
];
