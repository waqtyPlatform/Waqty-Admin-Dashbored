'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Ban, ShieldCheck, Trash2, RotateCcw, Pause, Play, MoreHorizontal, Loader2,
} from 'lucide-react';

export type EntityRowAction = 'activate' | 'deactivate' | 'block' | 'unblock' | 'delete' | 'restore';

interface EntityRowMenuProps {
    /** The entity whose status drives which menu items show. */
    entity: { active: boolean; blocked: boolean; deleted_at?: string | null };
    isOpen: boolean;
    isBusy: boolean;
    onToggle: () => void;
    onAction: (action: EntityRowAction) => void;
}

/**
 * Shared row-action dropdown used by BOTH the branches and employees tables.
 * Renders the MoreHorizontal trigger + the conditional menu items + the Loader2
 * busy spinner, exactly as the two original near-identical menus did.
 */
export function EntityRowMenu({ entity, isOpen, isBusy, onToggle, onAction }: EntityRowMenuProps) {
    const { t } = useTranslation();

    if (isBusy) {
        return <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />;
    }

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); onToggle(); }}
                aria-label={t('common.actions')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
                <MoreHorizontal size={16} />
            </button>
            {isOpen && (
                <div style={{ position: 'absolute', insetInlineEnd: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 150, padding: 'var(--space-1)' }} onClick={e => e.stopPropagation()}>
                    {!entity.deleted_at && (entity.active
                        ? <button onClick={() => onAction('deactivate')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}><Pause size={14} /> {t('common.deactivate')}</button>
                        : <button onClick={() => onAction('activate')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}><Play size={14} /> {t('common.activate')}</button>
                    )}
                    {!entity.deleted_at && (entity.blocked
                        ? <button onClick={() => onAction('unblock')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}><ShieldCheck size={14} /> {t('common.unblock')}</button>
                        : <button onClick={() => onAction('block')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-warning)', borderRadius: 'var(--radius-md)' }}><Ban size={14} /> {t('common.block')}</button>
                    )}
                    {entity.deleted_at
                        ? <button onClick={() => onAction('restore')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}><RotateCcw size={14} /> {t('common.restore')}</button>
                        : <button onClick={() => onAction('delete')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 'var(--radius-md)' }}><Trash2 size={14} /> {t('common.delete')}</button>
                    }
                </div>
            )}
        </div>
    );
}
