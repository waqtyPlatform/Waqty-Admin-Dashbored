'use client';

import { useTranslation } from '@/hooks/useTranslation';
import styles from './admin.module.css';

type StatusVariant = 'active' | 'suspended' | 'blocked' | 'soft_deleted' | 'pending' | 'expired' | 'trial' | 'rejected' | 'paid' | 'overdue' | 'draft' | 'paused' | 'completed' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'frozen' | 'healthy' | 'degraded' | 'down' | 'published' | 'flagged' | 'hidden' | string;

interface StatusBadgeProps {
    status: StatusVariant;
    size?: 'sm' | 'md';
}

// Colour class per status; the human label is resolved from i18n (`status.<key>`)
// so badges localise everywhere the component is used (every admin table/detail).
const STATUS_CLASS: Record<string, string> = {
    active: styles.statusActive,
    suspended: styles.statusWarning,
    blocked: styles.statusError,
    soft_deleted: styles.statusError,
    pending: styles.statusWarning,
    pending_review: styles.statusWarning,
    expired: styles.statusNeutral,
    trial: styles.statusInfo,
    rejected: styles.statusError,
    paid: styles.statusActive,
    overdue: styles.statusError,
    draft: styles.statusNeutral,
    paused: styles.statusWarning,
    completed: styles.statusActive,
    open: styles.statusInfo,
    in_progress: styles.statusInfo,
    resolved: styles.statusActive,
    closed: styles.statusNeutral,
    frozen: styles.statusError,
    healthy: styles.statusActive,
    degraded: styles.statusWarning,
    down: styles.statusError,
    published: styles.statusActive,
    flagged: styles.statusWarning,
    hidden: styles.statusNeutral,
    cancelled: styles.statusError,
    past_due: styles.statusError,
    deactivated: styles.statusNeutral,
    confirmed: styles.statusInfo,
    no_show: styles.statusError,
    scheduled: styles.statusInfo,
    ended: styles.statusNeutral,
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const { t } = useTranslation();
    const className = STATUS_CLASS[status] ?? styles.statusNeutral;
    // Known statuses have a `status.<key>` translation; unknown ones fall back to a
    // de-snaked version of the raw value (t() returns the key when it's missing).
    const key = `status.${status}`;
    const translated = t(key);
    const label = translated === key ? status.replace(/_/g, ' ') : translated;
    return (
        <span className={`${styles.statusBadge} ${className} ${size === 'sm' ? styles.statusSm : ''}`}>
            {label}
        </span>
    );
}
