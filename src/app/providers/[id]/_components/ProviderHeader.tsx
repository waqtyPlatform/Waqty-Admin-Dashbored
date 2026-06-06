'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { AdminProviderObject } from '@/lib/api';
import {
    Mail, Phone, MapPin, Ban, ShieldCheck, Trash2, RotateCcw, LogIn, Pause, Play,
} from 'lucide-react';
import styles from '../page.module.css';

interface ProviderHeaderProps {
    apiProvider: AdminProviderObject;
    onSetConfirmAction: (action: { action: string; label: string }) => void;
    onImpersonate: () => void;
}

export function ProviderHeader({ apiProvider, onSetConfirmAction, onImpersonate }: ProviderHeaderProps) {
    const { t, tn } = useTranslation();

    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.avatar}>{apiProvider.name.charAt(0)}</div>
                <div>
                    <div className={styles.headerName}>
                        <h1>{tn(apiProvider.name, apiProvider.name_ar)}</h1>
                        <StatusBadge status={apiProvider.active ? 'active' : 'inactive'} />
                        {apiProvider.blocked && <StatusBadge status="blocked" />}
                        {apiProvider.banned && <StatusBadge status="banned" />}
                        {apiProvider.deleted_at && <StatusBadge status="deleted" />}
                    </div>
                    <div className={styles.headerMeta}>
                        <span><Mail size={14} /> {apiProvider.email}</span>
                        <span><Phone size={14} /> {apiProvider.phone}</span>
                        {apiProvider.category && <span><MapPin size={14} /> {apiProvider.category.name}</span>}
                    </div>
                </div>
            </div>
            <div className={styles.headerActions}>
                <PermissionGate module="providers" action="edit">
                    {!apiProvider.deleted_at && (apiProvider.active
                        ? <button className={styles.actionBtn} onClick={() => onSetConfirmAction({ action: 'suspended', label: t('common.deactivate') })}><Pause size={14} /> {t('common.deactivate')}</button>
                        : <button className={styles.actionBtn} onClick={() => onSetConfirmAction({ action: 'active', label: t('common.activate') })}><Play size={14} /> {t('common.activate')}</button>
                    )}
                    {!apiProvider.deleted_at && (apiProvider.blocked
                        ? <button className={styles.actionBtn} onClick={() => onSetConfirmAction({ action: 'unblock', label: t('common.unblock') })}><ShieldCheck size={14} /> {t('common.unblock')}</button>
                        : <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => onSetConfirmAction({ action: 'block', label: t('common.block') })}><Ban size={14} /> {t('common.block')}</button>
                    )}
                    {apiProvider.deleted_at && <button className={styles.actionBtn} onClick={() => onSetConfirmAction({ action: 'restore', label: t('common.restore') })}><RotateCcw size={14} /> {t('common.restore')}</button>}
                </PermissionGate>
                <PermissionGate module="providers" action="impersonate">
                    {apiProvider.active && !apiProvider.deleted_at && <button className={`${styles.actionBtn} ${styles.impersonateBtn}`} onClick={onImpersonate}><LogIn size={14} /> {t('providers.impersonate')}</button>}
                </PermissionGate>
                <PermissionGate module="providers" action="delete">
                    {!apiProvider.deleted_at && <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => onSetConfirmAction({ action: 'soft_deleted', label: t('common.delete') })}><Trash2 size={14} /> {t('common.delete')}</button>}
                </PermissionGate>
            </div>
        </div>
    );
}
