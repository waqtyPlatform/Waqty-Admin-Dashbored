'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';

interface Admin {
    id: string;
    name: string;
}

interface ReassignModalProps {
    open: boolean;
    onClose: () => void;
    ticketId: string;
    currentAssigneeId: string;
    currentAssigneeName: string;
    admins: Admin[];
    onReassign: (adminId: string) => void;
}

export function ReassignModal({ open, onClose, ticketId, currentAssigneeId, currentAssigneeName, admins, onReassign }: ReassignModalProps) {
    const { t } = useTranslation();
    const [reassignTo, setReassignTo] = useState(currentAssigneeId);

    // Reset the selection to the current assignee each time the modal opens.
    useEffect(() => {
        if (open) setReassignTo(currentAssigneeId);
    }, [open, currentAssigneeId]);

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={`${t('support.reassignTicket')} — ${ticketId}`}
            submitLabel={t('support.reassign')}
            onSubmit={e => { e.preventDefault(); onReassign(reassignTo); }}
        >
            <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                <strong>{t('support.currentlyAssignedTo')}:</strong> {currentAssigneeName || t('support.unassigned')}
            </div>
            <FormField label={t('support.assignTo')} required>
                <select value={reassignTo} onChange={e => setReassignTo(e.target.value)} required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' }}>
                    <option value="">{t('support.selectAdmin')}</option>
                    {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </FormField>
        </FormModal>
    );
}
