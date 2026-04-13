export interface CommissionRecord {
    id: string;
    provider_id: string;
    provider_name: string;
    booking_id: string;
    booking_amount: number;
    commission_rate: number;
    commission_amount: number;
    status: 'pending' | 'collected' | 'waived';
    created_at: string;
}

export interface PayoutRecord {
    id: string;
    provider_id: string;
    provider_name: string;
    amount: number;
    currency: string;
    method: 'bank_transfer' | 'wallet' | 'check';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    period_start: string;
    period_end: string;
    created_at: string;
    completed_at: string | null;
}
