export interface DashboardKPI {
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
}

export interface RevenueDataPoint {
    month: string;
    subscriptions: number;
    commissions: number;
}

export interface CategoryBreakdown {
    name: string;
    count: number;
    color: string;
}

export interface TopProvider {
    id: string;
    name: string;
    category: string;
    bookings: number;
    revenue: number;
    rating: number;
}

export interface RecentActivity {
    id: string;
    type: 'registration' | 'subscription' | 'review' | 'ticket' | 'payout';
    title: string;
    description: string;
    time: string;
}

export const mockKPIs: DashboardKPI[] = [
    { label: 'dashboard.totalProviders', value: '1,247', change: 12.5, trend: 'up' },
    { label: 'dashboard.totalUsers', value: '48,392', change: 8.3, trend: 'up' },
    { label: 'dashboard.totalBookings', value: '156,847', change: 15.2, trend: 'up' },
    { label: 'dashboard.totalRevenue', value: 'EGP 2.4M', change: 22.1, trend: 'up' },
    { label: 'dashboard.activeSubscriptions', value: '892', change: 5.7, trend: 'up' },
    { label: 'dashboard.pendingRegistrations', value: '23', change: -3.2, trend: 'down' },
    { label: 'dashboard.openTickets', value: '47', change: -8.1, trend: 'down' },
    { label: 'dashboard.monthlyRevenue', value: 'EGP 340K', change: 18.4, trend: 'up' },
];

export const mockRevenueData: RevenueDataPoint[] = [
    { month: 'Jul', subscriptions: 180000, commissions: 95000 },
    { month: 'Aug', subscriptions: 195000, commissions: 102000 },
    { month: 'Sep', subscriptions: 210000, commissions: 108000 },
    { month: 'Oct', subscriptions: 225000, commissions: 115000 },
    { month: 'Nov', subscriptions: 240000, commissions: 125000 },
    { month: 'Dec', subscriptions: 260000, commissions: 138000 },
    { month: 'Jan', subscriptions: 275000, commissions: 142000 },
    { month: 'Feb', subscriptions: 290000, commissions: 155000 },
    { month: 'Mar', subscriptions: 310000, commissions: 168000 },
    { month: 'Apr', subscriptions: 340000, commissions: 180000 },
];

export const mockCategoryBreakdown: CategoryBreakdown[] = [
    { name: 'Salon', count: 485, color: '#00b166' },
    { name: 'Barber', count: 362, color: '#3b82f6' },
    { name: 'Clinic', count: 198, color: '#8b5cf6' },
    { name: 'Spa', count: 124, color: '#f59e0b' },
    { name: 'Nails', count: 78, color: '#ef4444' },
];

export const mockSubscriptionBreakdown: CategoryBreakdown[] = [
    { name: 'Basic', count: 412, color: '#9ca3af' },
    { name: 'Pro', count: 328, color: '#3b82f6' },
    { name: 'Enterprise', count: 152, color: '#00b166' },
    { name: 'Trial', count: 89, color: '#f59e0b' },
    { name: 'Expired', count: 266, color: '#ef4444' },
];

export const mockTopProviders: TopProvider[] = [
    { id: '1', name: 'Glamour Studio', category: 'Salon', bookings: 3420, revenue: 285000, rating: 4.9 },
    { id: '2', name: 'Elite Barbers', category: 'Barber', bookings: 2890, revenue: 195000, rating: 4.8 },
    { id: '3', name: 'Beauty Clinic Cairo', category: 'Clinic', bookings: 2150, revenue: 340000, rating: 4.7 },
    { id: '4', name: 'Royal Spa & Wellness', category: 'Spa', bookings: 1890, revenue: 278000, rating: 4.8 },
    { id: '5', name: 'Fresh Cuts Downtown', category: 'Barber', bookings: 1750, revenue: 142000, rating: 4.6 },
];

export const mockRecentActivity: RecentActivity[] = [
    { id: '1', type: 'registration', title: 'New Provider Registration', description: 'Luxury Hair Studio applied to join the platform', time: '5 min ago' },
    { id: '2', type: 'subscription', title: 'Plan Upgrade', description: 'Elite Barbers upgraded from Pro to Enterprise', time: '18 min ago' },
    { id: '3', type: 'review', title: 'Review Flagged', description: 'A review on Glamour Studio was flagged for inappropriate content', time: '1 hour ago' },
    { id: '4', type: 'ticket', title: 'Support Ticket', description: 'Fresh Cuts reported billing issue with subscription renewal', time: '2 hours ago' },
    { id: '5', type: 'payout', title: 'Payout Processed', description: 'EGP 45,000 payout completed for Beauty Clinic Cairo', time: '3 hours ago' },
    { id: '6', type: 'registration', title: 'New Provider Registration', description: 'Modern Nails Studio applied to join the platform', time: '5 hours ago' },
];
