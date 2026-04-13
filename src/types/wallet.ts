export type WalletAction = 'add' | 'deduct' | 'freeze' | 'unfreeze' | 'refund';
export type WalletStatus = 'active' | 'frozen';

export interface Wallet {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    balance: number;
    currency: string;
    status: WalletStatus;
    total_credits: number;
    total_debits: number;
    last_transaction_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface WalletTransaction {
    id: string;
    wallet_id: string;
    type: 'credit' | 'debit';
    action: WalletAction | 'payment' | 'booking_refund' | 'top_up';
    amount: number;
    balance_after: number;
    description: string;
    reference_id?: string;
    performed_by?: string;
    created_at: string;
}
