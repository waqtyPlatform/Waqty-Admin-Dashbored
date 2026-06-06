'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminBranchesApi, type BranchObject } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { EntityRowMenu, type EntityRowAction } from '../_components/EntityRowMenu';
import styles from '../page.module.css';

export function BranchesTab({ providerUuid }: { providerUuid: string }) {
    const { t } = useTranslation();

    // This tab only mounts when active, so the old `enabled: activeTab === 'branches'`
    // gating becomes mount-based.
    const { data: branches, loading: branchesLoading, refetch: refetchBranches } = useApiQuery(
        () => adminBranchesApi.list({ provider_uuid: providerUuid, per_page: 50 }),
        [providerUuid],
        { enabled: !!providerUuid }
    );

    const { mutate: updateBranchStatus } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: { active?: boolean; blocked?: boolean; banned?: boolean } }) =>
            adminBranchesApi.updateStatus(uuid, body)
    );
    const { mutate: deleteBranch } = useApiMutation((uuid: string) => adminBranchesApi.delete(uuid));
    const { mutate: restoreBranch } = useApiMutation((uuid: string) => adminBranchesApi.restore(uuid));

    const [branchMenuId, setBranchMenuId] = useState<string | null>(null);
    const [actionBusy, setActionBusy] = useState<string | null>(null);

    const handleBranchAction = async (branch: BranchObject, action: EntityRowAction) => {
        setBranchMenuId(null);
        setActionBusy(branch.uuid);
        if (action === 'activate')    await updateBranchStatus({ uuid: branch.uuid, body: { active: true } });
        else if (action === 'deactivate') await updateBranchStatus({ uuid: branch.uuid, body: { active: false } });
        else if (action === 'block')      await updateBranchStatus({ uuid: branch.uuid, body: { blocked: true } });
        else if (action === 'unblock')    await updateBranchStatus({ uuid: branch.uuid, body: { blocked: false } });
        else if (action === 'delete')     await deleteBranch(branch.uuid);
        else if (action === 'restore')    await restoreBranch(branch.uuid);
        setActionBusy(null);
        refetchBranches();
    };

    return (
        <div className={styles.infoCard}>
            <h3>{t('providers.branches')} {!branchesLoading && `(${(branches ?? []).length})`}</h3>
            {branchesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                    <Loader2 size={24} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : (branches ?? []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{t('providers.detail.noBranches')}</div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 'var(--space-4)' }}>
                <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                    {[t('providers.detail.colBranch'), t('common.phone'), t('common.main'), t('common.status'), t('common.actions')].map(h => (
                        <th key={h} style={{ textAlign: 'start', padding: 'var(--space-3) var(--space-3)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                    ))}
                </tr></thead>
                <tbody>{(branches ?? []).map(b => (
                    <tr key={b.uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', fontWeight: 500 }}>
                            {b.name}
                            {b.is_main && <span style={{ fontSize: '0.6875rem', padding: '1px var(--space-2)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-sm)', marginInlineStart: 'var(--space-2)' }}>{t('common.main')}</span>}
                            {b.deleted_at && <span style={{ fontSize: '0.6875rem', padding: '1px var(--space-2)', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', marginInlineStart: 'var(--space-2)' }}>{t('common.deleted')}</span>}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', color: 'var(--text-secondary)' }}>{b.phone ?? '—'}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>
                            {b.is_main ? <CheckCircle2 size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--text-tertiary)" />}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>
                            <StatusBadge status={b.deleted_at ? 'deleted' : b.blocked ? 'blocked' : b.active ? 'active' : 'inactive'} />
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>
                            <EntityRowMenu
                                entity={b}
                                isOpen={branchMenuId === b.uuid}
                                isBusy={actionBusy === b.uuid}
                                onToggle={() => setBranchMenuId(branchMenuId === b.uuid ? null : b.uuid)}
                                onAction={action => handleBranchAction(b, action)}
                            />
                        </td>
                    </tr>
                ))}</tbody>
            </table>
            )}
        </div>
    );
}
