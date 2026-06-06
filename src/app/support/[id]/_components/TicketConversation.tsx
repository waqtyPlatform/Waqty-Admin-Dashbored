'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, X as XIcon } from 'lucide-react';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useTranslation } from '@/hooks/useTranslation';
import type { TicketMessage } from '@/types/ticket';

type Attachment = { name: string; url: string };

interface TicketConversationProps {
    messages: TicketMessage[];
    onSend: (content: string, attachments: Attachment[]) => void;
}

export function TicketConversation({ messages, onSend }: TicketConversationProps) {
    const { t } = useTranslation();
    const [newMessage, setNewMessage] = useState('');
    const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSend = newMessage.trim().length > 0 || pendingAttachments.length > 0;

    const handleSend = () => {
        if (!canSend) return;
        onSend(newMessage, pendingAttachments);
        setNewMessage('');
        setPendingAttachments([]);
    };

    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setPendingAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }))]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('support.conversation')} ({messages.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.sender_type === 'admin' ? 'row-reverse' : 'row' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: msg.sender_type === 'admin' ? 'var(--color-primary-50)' : msg.sender_type === 'system' ? 'var(--bg-tertiary)' : 'var(--color-info-light)', color: msg.sender_type === 'admin' ? 'var(--color-primary-600)' : msg.sender_type === 'system' ? 'var(--text-tertiary)' : '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                            {msg.sender_type === 'system' ? '⚙' : msg.sender_name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, maxWidth: '75%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{msg.sender_name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <div style={{ padding: '12px 16px', background: msg.sender_type === 'admin' ? 'var(--color-primary-50)' : msg.sender_type === 'system' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', borderRadius: 12, fontSize: '0.875rem', lineHeight: 1.5, color: msg.sender_type === 'system' ? 'var(--text-tertiary)' : 'var(--text-primary)', fontStyle: msg.sender_type === 'system' ? 'italic' : 'normal' }}>
                                {msg.content}
                            </div>
                            {msg.attachments.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                                    {msg.attachments.map((a, i) => (
                                        <a key={i} href={a.url} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none' }}><Paperclip size={12} /> {a.name}</a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <PermissionGate module="support" action="edit">
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                    <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={t('support.typeReply')}
                        style={{ width: '100%', minHeight: 80, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                    {pendingAttachments.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                            {pendingAttachments.map((a, i) => (
                                <span key={`${a.name}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <Paperclip size={12} /> {a.name}
                                    <button type="button" onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex', color: 'var(--text-tertiary)' }} aria-label={`Remove ${a.name}`}><XIcon size={12} /></button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                            <Paperclip size={14} /> {t('support.attach')}
                            <input ref={fileInputRef} type="file" multiple onChange={handleFilesSelected} style={{ display: 'none' }} />
                        </label>
                        <button onClick={handleSend} disabled={!canSend} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: canSend ? 'var(--color-primary-500)' : 'var(--color-gray-300)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: canSend ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}><Send size={14} /> {t('support.sendReply')}</button>
                    </div>
                </div>
            </PermissionGate>
        </div>
    );
}
