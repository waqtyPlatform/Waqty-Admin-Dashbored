'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminEmployeesApi, type EmployeeObject } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { EntityRowMenu, type EntityRowAction } from '../_components/EntityRowMenu';
import styles from '../page.module.css';

export function EmployeesTab({ providerUuid }: { providerUuid: string }) {
    const { t } = useTranslation();

    // This tab only mounts when active, so the old `enabled: activeTab === 'employees'`
    // gating becomes mount-based.
    const { data: employees, loading: employeesLoading, refetch: refetchEmployees } = useApiQuery(
        () => adminEmployeesApi.list({ provider_uuid: providerUuid, per_page: 50 }),
        [providerUuid],
        { enabled: !!providerUuid }
    );

    const { mutate: updateEmployeeStatus } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: { active?: boolean; blocked?: boolean } }) =>
            adminEmployeesApi.updateStatus(uuid, body)
    );
    const { mutate: deleteEmployee } = useApiMutation((uuid: string) => adminEmployeesApi.delete(uuid));
    const { mutate: restoreEmployee } = useApiMutation((uuid: string) => adminEmployeesApi.restore(uuid));

    const [employeeMenuId, setEmployeeMenuId] = useState<string | null>(null);
    const [actionBusy, setActionBusy] = useState<string | null>(null);

    const handleEmployeeAction = async (emp: EmployeeObject, action: EntityRowAction) => {
        setEmployeeMenuId(null);
        setActionBusy(emp.uuid);
        if (action === 'activate')    await updateEmployeeStatus({ uuid: emp.uuid, body: { active: true } });
        else if (action === 'deactivate') await updateEmployeeStatus({ uuid: emp.uuid, body: { active: false } });
        else if (action === 'block')      await updateEmployeeStatus({ uuid: emp.uuid, body: { blocked: true } });
        else if (action === 'unblock')    await updateEmployeeStatus({ uuid: emp.uuid, body: { blocked: false } });
        else if (action === 'delete')     await deleteEmployee(emp.uuid);
        else if (action === 'restore')    await restoreEmployee(emp.uuid);
        setActionBusy(null);
        refetchEmployees();
    };

    return (
        <div className={styles.infoCard}>
            <h3>{t('providers.employees')} {!employeesLoading && `(${(employees ?? []).length})`}</h3>
            {employeesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                    <Loader2 size={24} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : (employees ?? []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{t('providers.detail.noEmployees')}</div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 'var(--space-4)' }}>
                <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                    {[t('providers.detail.colEmployee'), t('common.branch'), t('common.status'), t('common.blocked'), t('common.actions')].map(h => (
                        <th key={h} style={{ textAlign: 'start', padding: 'var(--space-3) var(--space-3)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                    ))}
                </tr></thead>
                <tbody>{(employees ?? []).map(e => (
                    <tr key={e.uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>
                            <div style={{ fontWeight: 600 }}>{e.name}</div>
                            {e.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.email}</div>}
                            {e.deleted_at && <span style={{ fontSize: '0.6875rem', padding: '1px var(--space-2)', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)' }}>{t('common.deleted')}</span>}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', color: 'var(--text-secondary)' }}>{e.branch?.name ?? '—'}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}><StatusBadge status={e.active ? 'active' : 'inactive'} /></td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>
                            {e.blocked ? <CheckCircle2 size={16} color="var(--color-error)" /> : <XCircle size={16} color="var(--text-tertiary)" />}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>
                            <EntityRowMenu
                                entity={e}
                                isOpen={employeeMenuId === e.uuid}
                                isBusy={actionBusy === e.uuid}
                                onToggle={() => setEmployeeMenuId(employeeMenuId === e.uuid ? null : e.uuid)}
                                onAction={action => handleEmployeeAction(e, action)}
                            />
                        </td>
                    </tr>
                ))}</tbody>
            </table>
            )}
        </div>
    );
}
