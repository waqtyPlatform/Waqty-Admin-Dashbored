'use client';

import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, Search, ChevronRight, Check, Plus } from 'lucide-react';
import styles from './ui.module.css';

// ─── Button ──────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    iconOnly?: boolean;
}

export function Button({ variant = 'primary', size = 'md', fullWidth, iconOnly, className, children, ...props }: ButtonProps) {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${iconOnly ? styles.iconOnly : ''} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
}

// ─── Badge ───────────────────────────────────────────────────────────
type BadgeColor = 'success' | 'error' | 'destructive' | 'warning' | 'info' | 'neutral' | 'primary' | 'purple' | 'amber';

interface BadgeProps {
    color?: BadgeColor;
    size?: 'sm' | 'md';
    children: ReactNode;
    style?: React.CSSProperties;
}

export function Badge({ color = 'neutral', size = 'md', children, style }: BadgeProps) {
    const colorMap: Record<BadgeColor, string> = {
        success: styles.badgeSuccess,
        error: styles.badgeError,
        destructive: styles.badgeError, // Alias for error
        warning: styles.badgeWarning,
        info: styles.badgeInfo,
        neutral: styles.badgeNeutral,
        primary: styles.badgePrimary,
        purple: styles.badgePurple,
        amber: styles.badgeAmber,
    };
    const sizeClass = size === 'sm' ? styles.badgeSm : '';
    return <span className={`${styles.badge} ${colorMap[color]} ${sizeClass}`} style={style}>{children}</span>;
}

// ─── Switch ──────────────────────────────────────────────────────────
interface SwitchProps { checked?: boolean; onChange?: (val: boolean) => void; label?: string; }

export function Switch({ checked = false, onChange, label }: SwitchProps) {
    const [on, setOn] = useState(checked);
    const handleClick = () => { const next = !on; setOn(next); onChange?.(next); };
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className={`${styles.toggle} ${on ? styles.toggleOn : styles.toggleOff}`} onClick={handleClick}>
                <div className={`${styles.toggleDot} ${on ? styles.toggleDotOn : styles.toggleDotOff}`} />
            </div>
            {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{label}</span>}
        </div>
    );
}

// ─── Input ───────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
}

export function Input({ label, hint, error, className, ...props }: InputProps) {
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.inputLabel}>{label}</label>}
            <input className={`${styles.input} ${error ? styles.inputHasError : ''} ${className || ''}`} {...props} />
            {hint && !error && <span className={styles.inputHint}>{hint}</span>}
            {error && <span className={styles.inputError}>{error}</span>}
        </div>
    );
}

// ─── Select ──────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: Array<{ value: string; label: string }>;
}

export function Select({ label, options, className, ...props }: SelectProps) {
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.inputLabel}>{label}</label>}
            <select className={`${styles.selectField} ${className || ''}`} {...props}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

// ─── Textarea ────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.inputLabel}>{label}</label>}
            <textarea className={`${styles.textareaField} ${className || ''}`} {...props} />
        </div>
    );
}

// ─── Checkbox ────────────────────────────────────────────────────────
interface CheckboxProps { checked?: boolean; onChange?: (val: boolean) => void; label: string; }

export function Checkbox({ checked = false, onChange, label }: CheckboxProps) {
    const [on, setOn] = useState(checked);
    const toggle = () => { const n = !on; setOn(n); onChange?.(n); };
    return (
        <div className={styles.checkbox} onClick={toggle}>
            <div className={`${styles.checkboxInput} ${on ? styles.checkboxChecked : ''}`}>
                {on && <Check size={12} />}
            </div>
            {label}
        </div>
    );
}

// ─── Modal ───────────────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; }

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
    if (!open) return null;
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>{title}</div>
                    <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
                </div>
                <div className={styles.modalBody}>{children}</div>
                {footer && <div className={styles.modalFooter}>{footer}</div>}
            </div>
        </div>
    );
}

// ─── SlideOver ────────────────────────────────────────────────────────
interface SlideOverProps { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; }

export function SlideOver({ open, onClose, title, children, footer }: SlideOverProps) {
    if (!open) return null;
    return (
        <>
            <div className={styles.slideOverOverlay} onClick={onClose} />
            <div className={styles.slideOver}>
                <div className={styles.slideOverHeader}>
                    <div className={styles.modalTitle}>{title}</div>
                    <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
                </div>
                <div className={styles.slideOverBody}>{children}</div>
                {footer && <div className={styles.slideOverFooter}>{footer}</div>}
            </div>
        </>
    );
}

// ─── EmptyState ──────────────────────────────────────────────────────
interface EmptyStateProps { icon: ReactNode; title: string; description: string; action?: ReactNode; }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{icon}</div>
            <div className={styles.emptyTitle}>{title}</div>
            <div className={styles.emptyDesc}>{description}</div>
            {action}
        </div>
    );
}

// ─── Skeleton ────────────────────────────────────────────────────────
interface SkeletonProps { variant?: 'text' | 'title' | 'circle' | 'card'; width?: number | string; height?: number | string; }

export function Skeleton({ variant = 'text', width, height }: SkeletonProps) {
    const variantClass = {
        text: styles.skeletonText,
        title: styles.skeletonTitle,
        circle: styles.skeletonCircle,
        card: styles.skeletonCard,
    };
    return <div className={`${styles.skeleton} ${variantClass[variant]}`} style={{ width, height }} />;
}

// ─── Toast System ────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem { id: string; type: ToastType; message: string; undoAction?: () => void; }

const ToastCtx = createContext<{ addToast: (type: ToastType, message: string, undoAction?: () => void) => void }>({ addToast: () => { } });

export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((type: ToastType, message: string, undoAction?: () => void) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, type, message, undoAction }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    const typeClass = {
        success: styles.toastSuccess,
        error: styles.toastError,
        warning: styles.toastWarning,
        info: styles.toastInfo,
    };

    return (
        <ToastCtx.Provider value={{ addToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((t) => (
                    <div key={t.id} className={`${styles.toast} ${typeClass[t.type]}`}>
                        <span>{t.message}</span>
                        {t.undoAction && <span className={styles.toastUndo} onClick={() => { t.undoAction?.(); remove(t.id); }}>Undo</span>}
                        <span className={styles.toastClose} onClick={() => remove(t.id)}><X size={14} /></span>
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────
interface BreadcrumbItem { label: string; href?: string; }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className={styles.breadcrumbs}>
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <ChevronRight size={14} className={styles.breadcrumbSep} />}
                    {item.href ? (
                        <a href={item.href} className={styles.breadcrumbItem}>{item.label}</a>
                    ) : (
                        <span className={`${styles.breadcrumbItem} ${styles.breadcrumbCurrent}`}>{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

// ─── Tabs ────────────────────────────────────────────────────────────
interface TabItem { key: string; label: string; icon?: ReactNode; }

interface TabsProps { items: TabItem[]; active: string; onChange: (key: string) => void; }

export function Tabs({ items, active, onChange }: TabsProps) {
    return (
        <div className={styles.tabGroup}>
            {items.map((tab) => (
                <button
                    key={tab.key}
                    className={`${styles.tabItem} ${active === tab.key ? styles.tabItemActive : ''}`}
                    onClick={() => onChange(tab.key)}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>
    );
}

// ─── Stepper ─────────────────────────────────────────────────────────
interface StepperProps { steps: string[]; current: number; }

export function Stepper({ steps, current }: StepperProps) {
    return (
        <div className={styles.stepper}>
            {steps.map((step, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <div className={`${styles.stepConnector} ${i <= current ? styles.stepConnectorDone : ''}`} />}
                    <div className={styles.step}>
                        <div className={`${styles.stepCircle} ${i < current ? styles.stepDone : i === current ? styles.stepActive : styles.stepPending}`}>
                            {i < current ? <Check size={14} /> : i + 1}
                        </div>
                        <span className={i === current ? styles.stepLabelActive : styles.stepLabel}>{step}</span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── FAB ─────────────────────────────────────────────────────────────
interface FABAction { label: string; icon: ReactNode; onClick: () => void; }

export function FAB({ actions }: { actions: FABAction[] }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            {open && (
                <div className={styles.fabMenu}>
                    {actions.map((a, i) => (
                        <button key={i} className={styles.fabItem} onClick={() => { a.onClick(); setOpen(false); }}>
                            {a.icon} {a.label}
                        </button>
                    ))}
                </div>
            )}
            <button className={styles.fab} onClick={() => setOpen(!open)}>
                <Plus size={24} style={{ transition: 'transform var(--transition-fast)', transform: open ? 'rotate(45deg)' : 'none' }} />
            </button>
        </>
    );
}

// ─── Timeline ────────────────────────────────────────────────────────
interface TimelineEvent { time: string; title: string; description?: string; }

export function Timeline({ events }: { events: TimelineEvent[] }) {
    return (
        <div className={styles.timeline}>
            {events.map((e, i) => (
                <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    {i < events.length - 1 && <div className={styles.timelineLine} />}
                    <div className={styles.timelineTime}>{e.time}</div>
                    <div className={styles.timelineTitle}>{e.title}</div>
                    {e.description && <div className={styles.timelineDesc}>{e.description}</div>}
                </div>
            ))}
        </div>
    );
}

// ─── SearchBar ───────────────────────────────────────────────────────
interface SearchBarProps { placeholder?: string; value?: string; onChange?: (val: string) => void; shortcut?: string; }

export function SearchBar({ placeholder = 'Search...', value, onChange, shortcut }: SearchBarProps) {
    return (
        <div className={styles.searchBar}>
            <Search size={16} className={styles.searchBarIcon} />
            <input
                className={styles.searchBarInput}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
            {shortcut && <span className={styles.searchShortcut}>{shortcut}</span>}
        </div>
    );
}

// ─── KPICard ─────────────────────────────────────────────────────────
interface KPICardProps {
    icon: ReactNode;
    iconBg: string;
    iconColor: string;
    value: string | number;
    label: string;
    trend?: { value: string; up: boolean };
}

export function KPICard({ icon, iconBg, iconColor, value, label, trend }: KPICardProps) {
    return (
        <div className={styles.kpiCard}>
            <div className={styles.kpiCardHeader}>
                <div className={styles.kpiCardLabel}>{label}</div>
                <div className={styles.kpiCardIcon} style={{ background: iconBg, color: iconColor }}>{icon}</div>
            </div>
            <div className={styles.kpiCardBody}>
                <div className={styles.kpiCardValue}>{value}</div>
                {trend && (
                    <div className={`${styles.kpiTrend} ${trend.up ? styles.kpiTrendUp : styles.kpiTrendDown}`}>
                        {trend.up ? '↑' : '↓'} {trend.value}
                    </div>
                )}
            </div>
        </div>
    );
}
// ─── DropdownMenu ────────────────────────────────────────────────────
interface DropdownItemProps { label: string; icon?: ReactNode; onClick: () => void; destructive?: boolean; }
interface DropdownMenuProps { trigger: ReactNode; items: DropdownItemProps[]; align?: 'left' | 'right'; }

export function DropdownMenu({ trigger, items, align = 'right' }: DropdownMenuProps) {
    const [open, setOpen] = useState(false);
    // Use a type cast or a more specific type if ref issues arise, but HTMLDivElement is correct for div
    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.dropdown} ref={ref}>
            <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(!open); }}>{trigger}</div>
            {open && (
                <div className={`${styles.dropdownMenu} ${align === 'right' ? styles.dropdownRight : styles.dropdownLeft}`}>
                    {items.map((item, i) => (
                        <button key={i} className={`${styles.dropdownItem} ${item.destructive ? styles.dropdownItemDestructive : ''}`} onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
