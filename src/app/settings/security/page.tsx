'use client';

import React, { useState } from 'react';
import { Shield, Key, Smartphone, Clock, AlertTriangle, Save } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

export default function SecurityPage() {
    const [settings, setSettings] = useState({
        requireMFA: true,
        mfaMethod: 'authenticator',
        passwordMinLength: 12,
        passwordRequireUppercase: true,
        passwordRequireNumber: true,
        passwordRequireSpecial: true,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        ipAllowlist: '',
        rateLimit: 100,
        requireStrongPasswordChange: 90,
    });
    const [saved, setSaved] = useState(false);

    const update = (key: string, value: unknown) => setSettings(prev => ({ ...prev, [key]: value }));
    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Shield size={24} />
                    <h1 className={shared.pageTitle}>Security Settings</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {saved && <span style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500 }}>Saved successfully!</span>}
                    <button onClick={handleSave} className={shared.addBtn}><Save size={16} /> Save</button>
                </div>
            </div>

            {/* MFA */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Smartphone size={18} color="var(--color-info)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Multi-Factor Authentication</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Row label="Require MFA for all admins" description="All admin users must enable MFA to access the dashboard">
                        <Toggle value={settings.requireMFA} onChange={v => update('requireMFA', v)} />
                    </Row>
                    <Row label="Default MFA Method">
                        <select value={settings.mfaMethod} onChange={e => update('mfaMethod', e.target.value)} style={selectStyle}>
                            <option value="authenticator">Authenticator App</option>
                            <option value="sms">SMS</option>
                            <option value="email">Email</option>
                        </select>
                    </Row>
                </div>
            </div>

            {/* Password Policy */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Key size={18} color="var(--color-primary-500)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Password Policy</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Row label="Minimum Password Length">
                        <input type="number" min={8} max={32} value={settings.passwordMinLength} onChange={e => update('passwordMinLength', Number(e.target.value))} className={shared.formInput} />
                    </Row>
                    <Row label="Require Uppercase Letter"><Toggle value={settings.passwordRequireUppercase} onChange={v => update('passwordRequireUppercase', v)} /></Row>
                    <Row label="Require Number"><Toggle value={settings.passwordRequireNumber} onChange={v => update('passwordRequireNumber', v)} /></Row>
                    <Row label="Require Special Character"><Toggle value={settings.passwordRequireSpecial} onChange={v => update('passwordRequireSpecial', v)} /></Row>
                    <Row label="Force Password Change Every (days)">
                        <input type="number" min={0} max={365} value={settings.requireStrongPasswordChange} onChange={e => update('requireStrongPasswordChange', Number(e.target.value))} className={shared.formInput} />
                    </Row>
                </div>
            </div>

            {/* Session */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Clock size={18} color="var(--color-warning)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Session & Access</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Row label="Session Timeout (minutes)" description="Auto-logout after this period of inactivity">
                        <input type="number" min={5} max={480} value={settings.sessionTimeout} onChange={e => update('sessionTimeout', Number(e.target.value))} className={shared.formInput} />
                    </Row>
                    <Row label="Max Failed Login Attempts">
                        <input type="number" min={3} max={10} value={settings.maxLoginAttempts} onChange={e => update('maxLoginAttempts', Number(e.target.value))} className={shared.formInput} />
                    </Row>
                    <Row label="API Rate Limit (requests/min)">
                        <input type="number" min={10} max={1000} value={settings.rateLimit} onChange={e => update('rateLimit', Number(e.target.value))} className={shared.formInput} />
                    </Row>
                </div>
            </div>

            {/* IP Allowlist */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <AlertTriangle size={18} color="var(--color-error)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>IP Allowlist</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    Restrict admin dashboard access to specific IPs. One per line. Leave empty to allow all.
                </p>
                <textarea value={settings.ipAllowlist} onChange={e => update('ipAllowlist', e.target.value)} placeholder="e.g.&#10;192.168.1.0/24&#10;10.0.0.5"
                    style={{ ...inputStyle, width: '100%', minHeight: 100, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} />
            </div>
        </div>
    );
}

const selectStyle = { ...inputStyle, cursor: 'pointer' };

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, display: 'block' }}>{label}</label>
                {description && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2, display: 'block' }}>{description}</span>}
            </div>
            {children}
        </div>
    );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: value ? 'var(--color-primary-500)' : 'var(--color-gray-300)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s' }} />
        </button>
    );
}
