'use client';

import React from 'react';
import { Modal } from '@/components/ui';
import { X, Loader2 } from 'lucide-react';
import styles from './FormModal.module.css';

interface FormModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    submitLabel?: string;
    submitVariant?: 'primary' | 'danger';
    loading?: boolean;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg';
}

export function FormModal({
    open,
    onClose,
    title,
    onSubmit,
    submitLabel = 'Save',
    submitVariant = 'primary',
    loading = false,
    children,
}: FormModalProps) {
    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="form-modal"
                        className={`${styles.submitBtn} ${submitVariant === 'danger' ? styles.dangerBtn : ''}`}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={14} className={styles.spinner} />}
                        {submitLabel}
                    </button>
                </div>
            }
        >
            <form id="form-modal" onSubmit={onSubmit} className={styles.form}>
                {children}
            </form>
        </Modal>
    );
}

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    variant = 'danger',
    loading = false,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`${styles.submitBtn} ${variant === 'danger' ? styles.dangerBtn : variant === 'warning' ? styles.warningBtn : ''}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={14} className={styles.spinner} />}
                        {confirmLabel}
                    </button>
                </div>
            }
        >
            <p className={styles.confirmMessage}>{message}</p>
        </Modal>
    );
}

interface FormFieldProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    error?: string;
    htmlFor?: string;
}

export function FormField({ label, required, children, error, htmlFor }: FormFieldProps) {
    return (
        <div className={styles.field}>
            <label className={styles.label} htmlFor={htmlFor}>
                {label} {required && <span className={styles.required}>*</span>}
            </label>
            {children}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
