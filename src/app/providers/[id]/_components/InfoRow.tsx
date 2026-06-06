'use client';

import React from 'react';
import styles from '../page.module.css';

export function InfoRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div className={styles.infoRow}>
            <span>{label}</span>
            <span style={capitalize ? { textTransform: 'capitalize' } : undefined}>{value}</span>
        </div>
    );
}
