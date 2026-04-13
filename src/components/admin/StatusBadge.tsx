'use client';

import styles from './admin.module.css';

type StatusVariant = 'active' | 'suspended' | 'blocked' | 'soft_deleted' | 'pending' | 'expired' | 'trial' | 'rejected' | 'paid' | 'overdue' | 'draft' | 'paused' | 'completed' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'frozen' | 'healthy' | 'degraded' | 'down' | 'published' | 'flagged' | 'hidden' | string;

interface StatusBadgeProps {
    status: StatusVariant;
    size?: 'sm' | 'md';
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: styles.statusActive },
    suspended: { label: 'Suspended', className: styles.statusWarning },
    blocked: { label: 'Blocked', className: styles.statusError },
    soft_deleted: { label: 'Deleted', className: styles.statusError },
    pending: { label: 'Pending', className: styles.statusWarning },
    pending_review: { label: 'Pending Review', className: styles.statusWarning },
    expired: { label: 'Expired', className: styles.statusNeutral },
    trial: { label: 'Trial', className: styles.statusInfo },
    rejected: { label: 'Rejected', className: styles.statusError },
    paid: { label: 'Paid', className: styles.statusActive },
    overdue: { label: 'Overdue', className: styles.statusError },
    draft: { label: 'Draft', className: styles.statusNeutral },
    paused: { label: 'Paused', className: styles.statusWarning },
    completed: { label: 'Completed', className: styles.statusActive },
    open: { label: 'Open', className: styles.statusInfo },
    in_progress: { label: 'In Progress', className: styles.statusInfo },
    resolved: { label: 'Resolved', className: styles.statusActive },
    closed: { label: 'Closed', className: styles.statusNeutral },
    frozen: { label: 'Frozen', className: styles.statusError },
    healthy: { label: 'Healthy', className: styles.statusActive },
    degraded: { label: 'Degraded', className: styles.statusWarning },
    down: { label: 'Down', className: styles.statusError },
    published: { label: 'Published', className: styles.statusActive },
    flagged: { label: 'Flagged', className: styles.statusWarning },
    hidden: { label: 'Hidden', className: styles.statusNeutral },
    cancelled: { label: 'Cancelled', className: styles.statusError },
    past_due: { label: 'Past Due', className: styles.statusError },
    deactivated: { label: 'Deactivated', className: styles.statusNeutral },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const info = STATUS_MAP[status] || { label: status.replace(/_/g, ' '), className: styles.statusNeutral };
    return (
        <span className={`${styles.statusBadge} ${info.className} ${size === 'sm' ? styles.statusSm : ''}`}>
            {info.label}
        </span>
    );
}
