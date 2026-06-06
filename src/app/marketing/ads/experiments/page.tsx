'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, ConfirmModal, FormField } from '@/components/admin/FormModal';
import { Modal } from '@/components/ui';
import { mockExperiments, type AdExperiment } from '@/mocks/experiments';
import { compareVariants } from '@/lib/analytics';
import { Plus, Pause, Play, Square, Eye, FlaskConical, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import shared from '@/components/admin/shared.module.css';

export default function ExperimentsPage() {
    const { t } = useTranslation();
    const [experiments, setExperiments] = useState<AdExperiment[]>(mockExperiments);
    const [showNew, setShowNew] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', hypothesis: '', labelA: '', labelB: '' });
    const [confirmEnd, setConfirmEnd] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);

    const results = useMemo(() => {
        return experiments.map(exp => ({ exp, result: compareVariants(exp.variants.A, exp.variants.B) }));
    }, [experiments]);

    const totalCount = experiments.length;
    const runningCount = experiments.filter(e => e.status === 'running').length;
    const completedCount = experiments.filter(e => e.status === 'completed').length;
    const avgLift = results.length > 0
        ? results.reduce((s, r) => s + r.result.lift, 0) / results.length
        : 0;

    const togglePause = (id: string) => {
        setExperiments(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'running' ? 'paused' : 'running' } : e));
    };

    const endExperiment = (id: string) => {
        setExperiments(prev => prev.map(e => e.id === id ? { ...e, status: 'completed', ended_at: new Date().toISOString() } : e));
        setConfirmEnd(null);
    };

    const handleNewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = `exp-${Date.now()}`;
        setExperiments(prev => [{
            id,
            name: newForm.name,
            hypothesis: newForm.hypothesis,
            status: 'running',
            started_at: new Date().toISOString(),
            ended_at: null,
            variants: {
                A: { id: `${id}-a`, label: newForm.labelA || t('marketing.experiments.variantA'), impressions: 0, clicks: 0, conversions: 0 },
                B: { id: `${id}-b`, label: newForm.labelB || t('marketing.experiments.variantB'), impressions: 0, clicks: 0, conversions: 0 },
            },
            traffic_split: 50,
        }, ...prev]);
        setShowNew(false);
        setNewForm({ name: '', hypothesis: '', labelA: '', labelB: '' });
    };

    const detail = detailId ? results.find(r => r.exp.id === detailId) : null;
    const winnerColor = (winner: string) => winner === 'A' ? 'success' : winner === 'B' ? 'info' : 'neutral';

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('marketing.experiments.title')}</h1>
                <button className={shared.addBtn} onClick={() => setShowNew(true)}>
                    <Plus size={16} /> {t('marketing.experiments.newExperiment')}
                </button>
            </div>

            <div className={shared.kpiGrid}>
                <div className={shared.kpiCard}>
                    <div className={shared.kpiIcon} style={{ background: 'color-mix(in srgb, var(--color-primary-500) 12%, transparent)', color: 'var(--color-primary-500)' }}><FlaskConical size={20} /></div>
                    <div><div className={shared.kpiLabel}>{t('common.total')}</div><div className={shared.kpiValue}>{totalCount}</div></div>
                </div>
                <div className={shared.kpiCard}>
                    <div className={shared.kpiIcon} style={{ background: 'color-mix(in srgb, var(--color-info) 12%, transparent)', color: 'var(--color-info)' }}><Play size={20} /></div>
                    <div><div className={shared.kpiLabel}>{t('marketing.experiments.running')}</div><div className={shared.kpiValue}>{runningCount}</div></div>
                </div>
                <div className={shared.kpiCard}>
                    <div className={shared.kpiIcon} style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}><Square size={20} /></div>
                    <div><div className={shared.kpiLabel}>{t('marketing.experiments.completed')}</div><div className={shared.kpiValue}>{completedCount}</div></div>
                </div>
                <div className={shared.kpiCard}>
                    <div className={shared.kpiIcon} style={{ background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)', color: 'var(--color-warning)' }}><TrendingUp size={20} /></div>
                    <div><div className={shared.kpiLabel}>{t('marketing.experiments.avgLift')}</div><div className={shared.kpiValue}>{avgLift.toFixed(1)}%</div></div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map(({ exp, result }) => {
                    const winnerLabel = result.winner === 'A' ? t('marketing.experiments.variantA')
                        : result.winner === 'B' ? t('marketing.experiments.variantB')
                        : t('marketing.experiments.inconclusive');
                    return (
                        <div key={exp.id} className={shared.infoCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{exp.name}</h3>
                                        <StatusBadge status={exp.status} />
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        <strong>{t('marketing.experiments.hypothesis')}:</strong> {exp.hypothesis}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button className={shared.actionBtn} onClick={() => setDetailId(exp.id)}>
                                        <Eye size={14} /> {t('marketing.experiments.resultDetail')}
                                    </button>
                                    {exp.status === 'running' && (
                                        <>
                                            <button className={shared.actionBtn} onClick={() => togglePause(exp.id)}>
                                                <Pause size={14} /> {t('common.pause')}
                                            </button>
                                            <button className={`${shared.actionBtn} ${shared.dangerBtn}`} onClick={() => setConfirmEnd(exp.id)}>
                                                <Square size={14} /> {t('marketing.experiments.endExperiment')}
                                            </button>
                                        </>
                                    )}
                                    {exp.status === 'paused' && (
                                        <button className={shared.actionBtn} onClick={() => togglePause(exp.id)}>
                                            <Play size={14} /> {t('common.resume')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 12 }}>
                                <VariantCard title={t('marketing.experiments.variantA')} label={exp.variants.A.label} v={exp.variants.A} ctr={result.ctrA} conv={result.convA} />
                                <VariantCard title={t('marketing.experiments.variantB')} label={exp.variants.B.label} v={exp.variants.B} ctr={result.ctrB} conv={result.convB} />
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                                <div><strong>{t('marketing.experiments.lift')}:</strong> <span style={{ color: result.lift >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{result.lift >= 0 ? '+' : ''}{result.lift.toFixed(1)}%</span></div>
                                <div><strong>{t('marketing.experiments.confidence')}:</strong> {result.confidence}%</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <strong>{t('marketing.experiments.winner')}:</strong>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: result.winner === 'A' ? 'var(--color-success)' : result.winner === 'B' ? 'var(--color-info)' : 'var(--text-secondary)',
                                        background: result.winner === 'A' ? 'color-mix(in srgb, var(--color-success) 14%, transparent)'
                                            : result.winner === 'B' ? 'color-mix(in srgb, var(--color-info) 14%, transparent)'
                                            : 'var(--bg-primary)',
                                    }}>{winnerLabel}</span>
                                </div>
                                <div style={{ marginInlineStart: 'auto', color: 'var(--text-tertiary)' }}>
                                    {t('marketing.experiments.sample')}: {result.sampleSize.toLocaleString()} {winnerColor(result.winner) ? '' : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* New experiment modal */}
            <FormModal
                open={showNew}
                onClose={() => setShowNew(false)}
                title={t('marketing.experiments.newExperiment')}
                submitLabel={t('common.create')}
                onSubmit={handleNewSubmit}
            >
                <FormField label={t('common.name')} required>
                    <input required className={shared.formInput} value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
                </FormField>
                <FormField label={t('marketing.experiments.hypothesis')} required>
                    <textarea required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} value={newForm.hypothesis} onChange={e => setNewForm(f => ({ ...f, hypothesis: e.target.value }))} />
                </FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.experiments.variantA')}>
                        <input className={shared.formInput} value={newForm.labelA} onChange={e => setNewForm(f => ({ ...f, labelA: e.target.value }))} placeholder={t('marketing.experiments.controlPlaceholder')} />
                    </FormField>
                    <FormField label={t('marketing.experiments.variantB')}>
                        <input className={shared.formInput} value={newForm.labelB} onChange={e => setNewForm(f => ({ ...f, labelB: e.target.value }))} placeholder={t('marketing.experiments.treatmentPlaceholder')} />
                    </FormField>
                </div>
            </FormModal>

            <ConfirmModal
                open={!!confirmEnd}
                onClose={() => setConfirmEnd(null)}
                onConfirm={() => confirmEnd && endExperiment(confirmEnd)}
                title={t('marketing.experiments.endExperiment')}
                message={t('marketing.experiments.endConfirmMessage')}
                confirmLabel={t('marketing.experiments.endExperiment')}
                variant="warning"
            />

            {/* Detail modal */}
            {detail && (
                <Modal open={!!detailId} onClose={() => setDetailId(null)} title={`${detail.exp.name} — ${t('marketing.experiments.resultDetail')}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <strong>{t('marketing.experiments.hypothesis')}:</strong> {detail.exp.hypothesis}
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={[
                                { metric: t('marketing.experiments.impressions'), A: detail.exp.variants.A.impressions, B: detail.exp.variants.B.impressions },
                                { metric: t('marketing.experiments.clicks'), A: detail.exp.variants.A.clicks, B: detail.exp.variants.B.clicks },
                                { metric: t('marketing.experiments.conversions'), A: detail.exp.variants.A.conversions, B: detail.exp.variants.B.conversions },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="metric" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                                <Legend />
                                <Bar dataKey="A" fill="var(--color-primary-500)" name={detail.exp.variants.A.label} />
                                <Bar dataKey="B" fill="var(--color-info)" name={detail.exp.variants.B.label} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className={shared.formGrid2}>
                            <div className={shared.summaryCard}>
                                <span className={shared.summaryLabel}>{t('marketing.experiments.ctrA')}</span>
                                <span className={shared.summaryValue}>{(detail.result.ctrA * 100).toFixed(2)}%</span>
                            </div>
                            <div className={shared.summaryCard}>
                                <span className={shared.summaryLabel}>{t('marketing.experiments.ctrB')}</span>
                                <span className={shared.summaryValue}>{(detail.result.ctrB * 100).toFixed(2)}%</span>
                            </div>
                            <div className={shared.summaryCard}>
                                <span className={shared.summaryLabel}>{t('marketing.experiments.convA')}</span>
                                <span className={shared.summaryValue}>{(detail.result.convA * 100).toFixed(2)}%</span>
                            </div>
                            <div className={shared.summaryCard}>
                                <span className={shared.summaryLabel}>{t('marketing.experiments.convB')}</span>
                                <span className={shared.summaryValue}>{(detail.result.convB * 100).toFixed(2)}%</span>
                            </div>
                            <div className={shared.summaryCard}>
                                <span className={shared.summaryLabel}>{t('marketing.experiments.lift')}</span>
                                <span className={shared.summaryValue} style={{ color: detail.result.lift >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {detail.result.lift >= 0 ? '+' : ''}{detail.result.lift.toFixed(1)}%
                                </span>
                            </div>
                            <div className={shared.summaryCard}>
                                <span className={shared.summaryLabel}>{t('marketing.experiments.confidence')}</span>
                                <span className={shared.summaryValue}>{detail.result.confidence}%</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function VariantCard({ title, label, v, ctr, conv }: { title: string; label: string; v: { impressions: number; clicks: number; conversions: number }; ctr: number; conv: number }) {
    const { t } = useTranslation();
    return (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, background: 'var(--bg-primary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2, marginBottom: 8 }}>{label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '0.8125rem' }}>
                <div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>{t('marketing.experiments.imprShort')}</div>
                    <div style={{ fontWeight: 600 }}>{v.impressions.toLocaleString()}</div>
                </div>
                <div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>{t('marketing.experiments.clicksShort')}</div>
                    <div style={{ fontWeight: 600 }}>{v.clicks.toLocaleString()} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({(ctr * 100).toFixed(1)}%)</span></div>
                </div>
                <div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>{t('marketing.experiments.convShort')}</div>
                    <div style={{ fontWeight: 600 }}>{v.conversions.toLocaleString()} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({(conv * 100).toFixed(1)}%)</span></div>
                </div>
            </div>
        </div>
    );
}
