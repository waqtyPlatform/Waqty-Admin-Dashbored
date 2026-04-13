export type UserStatus = 'active' | 'blocked' | 'suspended' | 'soft_deleted';

export interface PlatformUser {
    id: string;
    uuid: string;
    name: string;
    email: string;
    phone: string;
    avatar_url?: string;
    status: UserStatus;
    gender?: 'male' | 'female';
    date_of_birth?: string;
    country: string;
    city: string;
    total_bookings: number;
    total_spent: number;
    wallet_balance: number;
    last_booking_at: string | null;
    last_active_at: string;
    registered_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
