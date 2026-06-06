// ADMIN-ONLY (SA-8′): the wallet/ledger is a SuperAdmin platform concern and has
// NO canonical contract counterpart — the ecosystem contract models money on
// `Payment`/`Visit`, not a standing customer wallet. These types are therefore
// intentionally local and are NOT a duplicate/divergence of any contract entity.
// `balance`/`total_credits`/`total_debits` are canonical Money (MINOR units, X4b).
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
    /** Local ledger of manual admin adjustments (reason is recorded here). */
    transactions?: WalletTransaction[];
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
