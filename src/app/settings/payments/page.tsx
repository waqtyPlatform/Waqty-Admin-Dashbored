'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { CreditCard, Wallet, Smartphone } from 'lucide-react';

const initialGateways = [
    { id: '1', name: 'Stripe', icon: <CreditCard size={20} />, status: 'active', type: 'Credit/Debit Cards', fee: '2.9% + EGP 1', enabled: true },
    { id: '2', name: 'PayPal', icon: <Wallet size={20} />, status: 'active', type: 'PayPal Payments', fee: '3.4% + EGP 1.50', enabled: true },
    { id: '3', name: 'Apple Pay', icon: <Smartphone size={20} />, status: 'active', type: 'Mobile Payment', fee: '2.9%', enabled: true },
    { id: '4', name: 'Google Pay', icon: <Smartphone size={20} />, status: 'active', type: 'Mobile Payment', fee: '2.9%', enabled: true },
    { id: '5', name: 'Fawry', icon: <CreditCard size={20} />, status: 'active', type: 'Local Payment', fee: '1.5%', enabled: true },
    { id: '6', name: 'Vodafone Cash', icon: <Smartphone size={20} />, status: 'degraded', type: 'Mobile Wallet', fee: '1%', enabled: false },
];

export default function PaymentsPage() {
    const [gateways, setGateways] = useState(initialGateways);

    const toggleGateway = (id: string) => {
        setGateways(prev => prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Payment Gateways</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {gateways.map(g => (
                    <div key={g.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>{g.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600 }}>{g.name}</span>
                                <StatusBadge status={g.status} />
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{g.type} &middot; Fee: {g.fee}</div>
                        </div>
                        <button onClick={() => toggleGateway(g.id)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: g.enabled ? 'var(--color-primary-500)' : 'var(--color-gray-300)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                            <span style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, left: g.enabled ? 23 : 3, transition: 'left 0.2s' }} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
